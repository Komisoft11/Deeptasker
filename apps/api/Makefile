start:
	docker-compose up -d
	sleep 3  
	bun dev 

stop:
	docker-compose stop

migrate:
	npx mikro-orm migration:up

create-migrate:
	npx mikro-orm migration:create -b
