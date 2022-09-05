SHELL := /bin/bash
.SHELLFLAGS = -ec
.ONESHELL:
.SILENT:

.EXPORT_ALL_VARIABLES:
REPO_DIRECTORY:=$(shell pwd)
PYTHONPATH:=${PYTHONPATH}:${REPO_DIRECTORY}

.PHONY: help
help:
	echo "❓ Use \`make <target>'"
	grep -E '^\.PHONY: [a-zA-Z0-9_-]+ .*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = "(: |##)"}; {printf "\033[36m%-30s\033[0m %s\n", $$2, $$3}'


.PHONY: lint  ## 🐍 Lint Python files to conform to the PEP 8 style guide
lint:
	flake8

.PHONY: conda_env  ## 🐍 Create a Python conda environment
conda_env:
	python3.9 -m venv explorations-cdtn
	source explorations-cdtn/bin/activate

.PHONY: dependencies  ## ⏬ Install development dependencies
dependencies:
	pip install -e .[dev]

.PHONY: unit_tests  ## ✅ Launch the unit tests
unit_tests:
	pytest tests
