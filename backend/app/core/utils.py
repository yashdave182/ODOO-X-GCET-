def generate_login_id(
    first_name: str,
    last_name: str,
    year_of_joining: int,
    serial: int,
) -> str:
    return (
        "OI"
        + first_name[:2].upper()
        + last_name[:2].upper()
        + str(year_of_joining)
        + str(serial).zfill(4)
    )
