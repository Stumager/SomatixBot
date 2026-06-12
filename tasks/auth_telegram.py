import hmac
import hashlib
import time
from urllib.parse import parse_qsl


def verify_telegram_data(bot_token, init_data, max_age_seconds=None):
    if not bot_token or not init_data:
        return False

    try:
        vals = dict(parse_qsl(init_data, keep_blank_values=True))
    except ValueError:
        return False

    hash_to_check = vals.pop("hash", None)
    if not hash_to_check:
        return False

    data_check_string = "\n".join([f'{k}={v}' for k, v in sorted(vals.items())])

    secret_key = hmac.new('WebAppData'.encode(), bot_token.encode(), hashlib.sha256).digest()

    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(calculated_hash, hash_to_check):
        return False

    if max_age_seconds is not None:
        auth_date = vals.get("auth_date")
        if not auth_date:
            return False

        try:
            auth_timestamp = int(auth_date)
        except (TypeError, ValueError):
            return False

        if time.time() - auth_timestamp > max_age_seconds:
            return False

    return True
