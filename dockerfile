# Step 1: Use a lightweight Node.js image
FROM node:18-alpine

# Step 2: Set the working directory
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Build the Nuxt.js application
RUN npm run build

# Step 7: Expose the port that Nuxt.js runs on (default: 3000)
EXPOSE 3000

# Step 8: Start the Nuxt.js application
CMD ["npm", "run", "start"]
