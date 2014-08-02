FROM moul/node

RUN npm install express@3.4.8 socket.io@0.9.16
ADD . /app
RUN npm install
ENTRYPOINT ["coffee", "app.coffee"]
