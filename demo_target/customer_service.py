"""Small demo helpers that exercise Stripe resource objects."""

import stripe


def customer_email(customer: stripe.Customer) -> str | None:
    data = customer.to_dict()
    return data.get("email")


def customer_fields(customer: stripe.Customer) -> list[str]:
    data = customer.to_dict()
    return sorted(data.keys())


def customer_metadata(customer: stripe.Customer) -> dict[str, str]:
    data = customer.to_dict()
    return dict(data.get("metadata", {}).items())


def customer_snapshot(customer: stripe.Customer) -> dict[str, object]:
    return customer.to_dict()
