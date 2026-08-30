"""Intentionally outdated Stripe v14 code for the migration demo."""

import stripe


def customer_email(customer: stripe.Customer) -> str | None:
    return customer.get("email")


def customer_fields(customer: stripe.Customer) -> list[str]:
    return sorted(customer.keys())


def customer_metadata(customer: stripe.Customer) -> dict[str, str]:
    return dict(customer.get("metadata", {}).items())


def customer_snapshot(customer: stripe.Customer) -> dict[str, object]:
    return dict(customer)
