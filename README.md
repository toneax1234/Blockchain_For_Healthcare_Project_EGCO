Blockchain_For_Healthcare_Project_EGCO

#How to Run docker environment and peer setup
1. cd blockchain
2. open in terminal 
3. type 'make ca'
4. type 'make up'
5. type 'make join'


#setup our chaincode

1. install chaincode do it only once via starting the network
docker exec cli-peer0-org1  bash -c 'peer chaincode install -l node -n profilecontract -p /opt/gopath/src/nodejs -v 0'
docker exec cli-peer1-org1  bash -c 'peer chaincode install -l node -n profilecontract -p /opt/gopath/src/nodejs -v 0'
docker exec cli-peer0-org2  bash -c 'peer chaincode install -l node -n profilecontract -p /opt/gopath/src/nodejs -v 0'
docker exec cli-peer1-org2  bash -c 'peer chaincode install -l node -n profilecontract -p /opt/gopath/src/nodejs -v 0'
docker exec cli-peer0-org3  bash -c 'peer chaincode install -l node -n profilecontract -p /opt/gopath/src/nodejs -v 0'
docker exec cli-peer1-org3  bash -c 'peer chaincode install -l node -n profilecontract -p /opt/gopath/src/nodejs -v 0'

2. instantiate chaincode *do it on a peer no need to do with all peers *
docker exec cli-peer0-org1 bash -c "peer chaincode instantiate -l node -n profilecontract -v 0 -C mainchannel -c '{\"Args\":[]}' -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/ca-root-7054.pem"

3. BOOM The network and chaincode ready to use

#run back-end and front end

** dont forget to npm install

1. cd blockchain/backend and type node server.js
2. cd blockchain/frontend and type npm run serve or whatever you want
