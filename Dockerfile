# Base image for Java
FROM openjdk:22-slim-bullseye

# Set the working directory
WORKDIR /app

# Install required packages
RUN apt-get update && apt-get install -y ca-certificates curl gnupg

# Import Node.js repository GPG key
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/trusted.gpg.d/nodesource.gpg

# Set Node.js version
ARG NODE_MAJOR=20

# Add Node.js repository to sources.list
RUN echo "deb [signed-by=/etc/apt/trusted.gpg.d/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" > /etc/apt/sources.list.d/nodesource.list

# Install Node.js
RUN apt-get update && apt-get install -y nodejs

# Copy the files \
COPY . .

# Install the dependencies
RUN npm install

# Attach the terminal
CMD ["/bin/sh"]