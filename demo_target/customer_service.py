from __future__ import annotations

import stripe


def customer_email(customer: stripe.Customer) -> str | None:
    return customer.to_dict().get("email")
