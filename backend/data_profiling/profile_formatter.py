##
# This file turns big structured profiles into compact prompt text.

# The profiler output may be large. You do not want to dump the whole thing into every prompt.

## Selected Table Profile: cancellations
# - Rows: 12,000
# - Columns: 5
# - Important columns:
#   - cancellation_reason: categorical, 8 distinct values. Top values: weather (3,200), driver_unavailable (2,100)
#   - ride_id: likely foreign key, 11,880 distinct values
#   - created_at: datetime from 2025-01-01 to 2025-12-31
# ## Related Tables
# - cancellations.ride_id likely joins to rides.ride_id (confidence 0.96)
# - rides.driver_id likely joins to drivers.driver_id (confidence 0.91)
# ## Analysis Opportunities
# - Analyze cancellation reasons over time
# - Join cancellations to rides and drivers to analyze driver or city-level patterns