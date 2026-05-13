# The data profiler is a module that is used to get basic statistical information about the data.
# Before we run our insight agent we want to retrieve dataset metadata, build sample rows
# then build our data profile.

# This can be the orchestrator.

# It calls:

# table_profiler.profile_table(...) for every table
# relationship_profiler.profile_relationships(...)

import duckdb
