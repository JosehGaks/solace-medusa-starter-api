FROM node:latest

WORKDIR /app/medusa

COPY . .

RUN apt-get update && apt-get install -y python3 python3-pip python-is-python3

# Enable Corepack and set the required Yarn version
RUN corepack enable
RUN corepack prepare yarn@3.2.3 --activate

RUN yarn
RUN yarn build

CMD ["yarn", "db:migrate", "&&", "yarn", "start"]
