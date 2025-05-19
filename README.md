# Defi Dashboard (chaos<3)

# DB setup
## Step 1:
`sudo dnf install sqlite`

## Step 2: generate data
`npm run sql:gen`

## Step 3: make shell script exec
`npm run sql:cmod`

## Step 4: create db with data
`npm run sql:init`

# Start App local
`npm run dev`

## TODO:
* DONE: clean up tsconfig
* DONE: clean up lib mov utils.tsx
* DONE: eslint
* Self deploy (docker)

## Optional:
* shadcn
* login or anon login page
