
IGNITION_DB_CLUSTER = {
    "connection_timeout": 1,
    "failover": [
        {
            "host": host,
            "database": "mf_ignition",
            "user": "beaglebone",
            "port": "3306",
            "password": "predictsurroundoutertourist",
        }
        for host in (
            # "ignition.corp.markforged.com",
            "ignition1.corp.markforged.com",
            # "ignition2.corp.markforged.com",
        )
    ],
}

FETCH_COA_QUERY = """
    SELECT * FROM material_specs
"""