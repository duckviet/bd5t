# Activity Notifications Plan

## Progress Table

- Do not use `progress` as the source of notification targeting.
- Treat `progress` as a legacy cache for the existing `/progress` API.
- Activity notification targeting is computed directly from `evidences`, `activity_criteria`, `criteria`, `activities`, and `users`.

## Notification Rules

- Recipients must be users with role `student`.
- If an activity has `unit_id`, recipients must have the same `unit_id`.
- The activity must be active.
- A recipient must still be missing at least one `(criteria_code, review_level)` pair offered by the activity.
- Approved evidence is resolved by `activity_criteria_id`, then `criterion_type`, then all criteria on the evidence activity when the evidence applies to the whole activity.

## Notification Types

- `ACTIVITY_NEW`
- `ACTIVITY_DEADLINE_SOON`
- `SUGGESTION`

## Batch Keys

- `ACTIVITY_NEW`: `activity-new:<activityId>`
- `ACTIVITY_DEADLINE_SOON`: `deadline:<activityId>:<days>:<yyyy-mm-dd>`
- `SUGGESTION`: `suggestion:<activityId>:<yyyy-mm-dd>`
