FROM mhart/alpine-node:8.11.1

# Create and set app working directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json and package-lock.json are copied
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 80
CMD [ "npm", "start" ]