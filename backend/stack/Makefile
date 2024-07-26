.PHONY: build

# Globals
region = us-west-1
stack_name = GuardianForge-$(SITE_ALIAS)
artifacts_bucket = guardianforge-$(SITE_ALIAS)-samartifacts

build:
	sam build

run: build
	sam local start-api --env-vars devenv.json -p 4040

transform-params:
	go run scripts/transform-params.go

deploy-branch: transform-params
	@if aws s3api list-buckets | grep \"Name\":\ \"$(artifacts_bucket)\"; then \
		echo "Bucket '$(artifacts_bucket)' already exists."; \
	else \
		echo "Creating bucket '$(artifacts_bucket)'..."; \
		aws s3api create-bucket --bucket $(artifacts_bucket) --region $(region) --create-bucket-configuration LocationConstraint=$(region); \
		echo "Bucket created!"; \
	fi

	go run ./scripts/deploy.go $(stack_name) $(artifacts_bucket) $(region) "$(shell cat sam.params)"

deploy-qa: build transform-params
	@if aws s3api list-buckets | grep \"Name\":\ \"$(qa_artifacts_bucket)\"; then \
		echo "Bucket '$(qa_artifacts_bucket)' already exists."; \
	else \
		echo "Creating bucket '$(qa_artifacts_bucket)'..."; \
		aws s3api create-bucket --bucket $(qa_artifacts_bucket) --region $(region) --create-bucket-configuration LocationConstraint=$(region); \
		echo "Bucket created!"; \
	fi

	go run ./scripts/deploy.go $(qa_stack_name) $(qa_artifacts_bucket) $(region) "$(shell cat sam.params)"

deploy-prod: build transform-params
	@if aws s3api list-buckets | grep \"Name\":\ \"$(prod_artifacts_bucket)\"; then \
		echo "Bucket '$(prod_artifacts_bucket)' already exists."; \
	else \
		echo "Creating bucket '$(prod_artifacts_bucket)'..."; \
		aws s3api create-bucket --bucket $(prod_artifacts_bucket) --region $(region) --create-bucket-configuration LocationConstraint=$(region); \
		echo "Bucket created!"; \
	fi

	go run ./scripts/deploy.go $(prod_stack_name) $(prod_artifacts_bucket) $(region) "$(shell cat sam.params)"

holding:
	sam deploy --stack-name $(prod_stack_name) \
		--s3-bucket $(prod_artifacts_bucket) \
		--region $(region) \
		--parameter-overrides EnvironmentParam=qa \
		--no-confirm-changeset \
		--profile $(prod_profile)
		--capabilities CAPABILITY_IAM