import os
import uuid
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient


try:
    print("Azure Blob Storage Python quickstart sample")

    account_url = "https://dataspacegroup.blob.core.windows.net"
    default_credential = DefaultAzureCredential()

    # Create the BlobServiceClient object
    blob_service_client = BlobServiceClient(
        account_url, credential=default_credential)

    container_name = str(uuid.uuid4())

    container_client = blob_service_client.create_container(container_name)

    # Create a local directory to hold blob data
    local_path = "./data"
    os.mkdir(local_path)

    # Create a file in the local data directory to upload and download
    local_file_name = str(uuid.uuid4()) + ".txt"
    upload_file_path = os.path.join(local_path, local_file_name)

    # Write text to the file
    file = open(file=upload_file_path, mode='w')
    file.write("Hello, World!")
    file.close()

    # Create a blob client using the local file name as the name for the blob
    blob_client = blob_service_client.get_blob_client(
        container=container_name, blob=local_file_name)

    print("\nUploading to Azure Storage as blob:\n\t" + local_file_name)

    # Upload the created file
    with open(file=upload_file_path, mode="rb") as data:
        blob_client.upload_blob(data)

    # Listing blobs inside of the container.
    blob_list = container_client.list_blobs()

except Exception as ex:
    print('Exception:')
    print(ex)


# I think an issue while developing is that during the quick-start i didnt see any details on installing Azure CLI, for new users of my project how can I create a bash script or something that can help them install requirements.txt the correct python version and azure cli from brew
