## SLA Metadata Generator - GitHub Action

A GitHub action implemented to support generation of sla from open api specs as part of SLA Monitoring Project.

```yaml
# .github/workflows/pr.yml
name: SLA Metadata Generator
on:
    push:
      branches:  
        - master  
jobs:
  meta_gen:
    runs-on: ubuntu-latest
    name: Metadata Generator
    steps:
    
      - name : Checkout 
        uses: actions/checkout@v3
      
      - name: Generate Metadata
        id: generate_metadata
        uses: chargebee-test/sla-meta-generator@v22
        with:
          spec-files: '["spec.yaml"]'
          micro-service: 'test-app'
          
      - run : cat test-app-endpoints.json
```

## What it does

After successful configuration of this GitHub action as mentioned above, it will take care of automatically creating SLA metadata from the spec.yaml files mentioned. 

## How to make changes and deploy
1. create a new branch
2. make the required changes and build the package using the `npm run release` command.
3. raise a PR to the `master` branch
4. After the PR merge, the updated GitHub action can be a accessed from `chargebee-test/sla-meta-generator@master` 