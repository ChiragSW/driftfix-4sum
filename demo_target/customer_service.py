"""Stripe v15-compatible code for the migration demo."""

import stripe


def customer_email(customer: stripe.Customer) -> str | None:
    return customer.to_dict().get("email")


def customer_fields(customer: stripe.Customer) -> list[str]:
    return sorted(customer.to_dict().keys())


def customer_metadata(customer: stripe.Customer) -> dict[str, str]:
    return dict(customer.to_dict().get("metadata", {}).items())


def customer_snapshot(customer: stripe.Customer) -> dict[str, object]:
    return customer.to_dict()
