import logging
import os
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path
from tempfile import TemporaryDirectory

from connection import connect_azure_blob_storage
from db_helpers.db_constants import Dataset
from db_helpers.db_metadata import metadata_references_blob, save_metadata

logger = logging.getLogger(__name__)


def dataset_container() -> str:
    return os.environ["CONTAINER_NAME"]


def store_dataset(dataset: Dataset, source: Path) -> None:
    with connect_azure_blob_storage() as storage:
        blob = storage.get_blob_client(container=dataset_container(), blob=dataset.path)
        with source.open("rb") as file:
            blob.upload_blob(file, length=dataset.raw_byte_size, overwrite=False)

        try:
            save_metadata(dataset)
        except Exception:
            # A commit can succeed even when the connection fails before acknowledgment.
            try:
                if not metadata_references_blob(dataset):
                    blob.delete_blob()
            except Exception:
                logger.exception("Could not reconcile blob for dataset %s", dataset.dataset_id)
            raise


@contextmanager
def local_dataset_file(dataset: Dataset) -> Iterator[Path]:
    with TemporaryDirectory() as directory:
        # The metadata path is a blob key. Use a fixed name on the local filesystem.
        path = Path(directory) / "source"
        with connect_azure_blob_storage() as storage:
            blob = storage.get_blob_client(container=dataset_container(), blob=dataset.path)
            with path.open("wb") as file:
                blob.download_blob().readinto(file)
        yield path
