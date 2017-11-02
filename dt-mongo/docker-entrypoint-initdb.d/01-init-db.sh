#!/bin/bash

echo Starting db init
echo "Log start" >> mongo-logs/mongod.log
if ! [[ -f /data/db/mydb-initialized ]]; then
	mongod --shutdown \
	&& mongod --fork --logpath /mongo-logs/mongod.log \
	&& mongo <<-EOF
		use admin;

		db.createUser({
			user: "$MONGO_INIT_USER",
			pwd: "$MONGO_INIT_PASSWORD",
			roles: [ "root" ]
		});

		db.createUser({
			user: "$DT_USER",
			pwd: "$DT_PASSWORD",
			roles: [
				{ role: 'clusterMonitor', db:'admin' },
				{ role: 'readWrite', db: "$DT_DATABASE" }
			]
		});
	EOF

  echo added users

	mongod --shutdown \
		&& mongod --auth --fork --logpath /mongo-logs/mongod.log --replSet replica0 \
		&& mongo <<-EOF
			use admin;
			db.auth("$MONGO_INIT_USER", "$MONGO_INIT_PASSWORD");
			rs.initiate({
				_id: "replica0",
				members: [
					{ _id: 0, host: "localhost:27017" }
				]
			});
		EOF

  echo added replication
	touch /data/db/mydb-initialized
fi
