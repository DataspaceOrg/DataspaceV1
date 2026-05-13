# same-name columns
# id-like columns
# primary-key candidates
# foreign-key candidates
# value overlap between columns
# one-to-many / many-to-one guesses
# relationship confidence scores

## eg) output

# [
#   {
#     "from_table": "cancellations",
#     "from_column": "ride_id",
#     "to_table": "rides",
#     "to_column": "ride_id",
#     "relationship_type": "many_to_one",
#     "confidence": 0.96,
#     "reason": "Columns share the same name, rides.ride_id is nearly unique, and 95% of cancellation ride_id values appear in rides.ride_id."
#   },
#   {
#     "from_table": "rides",
#     "from_column": "driver_id",
#     "to_table": "drivers",
#     "to_column": "driver_id",
#     "relationship_type": "many_to_one",
#     "confidence": 0.91,
#     "reason": "Columns share the same name and drivers.driver_id appears unique while rides.driver_id repeats."
#   }
# ]