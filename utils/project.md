Here’s a table summarizing all the required API routes:


| **Method** | **Endpoint**                  | **Description**                                                 | **Request Body (JSON)**                          | **Response (Example)**                                                                           |
| ---------- | ----------------------------- | --------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **GET**    | `/gadgets`                    | Retrieve all gadgets with a random mission success probability. | _None_                                           | `[{"id": "123", "name": "The Nightingale", "status": "Available", "successProbability": "87%"}]` |
| **GET**    | `/gadgets?status={status}`    | Retrieve gadgets filtered by status.                            | _None_                                           | `[{"id": "456", "name": "The Kraken", "status": "Deployed"}]`                                    |
| **POST**   | `/gadgets`                    | Add a new gadget with a unique codename.                        | `{"name": "Laser Pen"}`                          | `{"id": "789", "name": "The Phantom", "status": "Available"}`                                    |
| **PATCH**  | `/gadgets/{id}`               | Update an existing gadget’s details.                            | `{"name": "Updated Name", "status": "Deployed"}` | `{"id": "123", "name": "Updated Name", "status": "Deployed"}`                                    |
| **DELETE** | `/gadgets/{id}`               | Mark a gadget as "Decommissioned" with a timestamp.             | _None_                                           | `{"id": "123", "status": "Decommissioned", "decommissionedAt": "2025-02-13T10:00:00Z"}`          |
| **POST**   | `/gadgets/{id}/self-destruct` | Trigger self-destruct with a random confirmation code.          | _None_                                           | `{"message": "Self-destruct initiated", "confirmationCode": "XJ72K9"}`                           |


# there is already a table in the postgres database called gadgets

id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
codename VARCHAR(100) NOT NULL UNIQUE,
name VARCHAR(255) NOT NULL,
description TEXT,
status gadget_status DEFAULT 'Available',
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
decommissioned_at TIMESTAMP WITH TIME ZONE,
last_mission_date TIMESTAMP WITH TIME ZONE