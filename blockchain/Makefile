clean:
	docker stop $$(docker ps -a -q)
	docker system prune
	sudo rm -rf state
	sudo rm -rf crypto-config
	sudo rm -rf scripts/crypto-config
	rm -rf orderer
	rm -rf channels
	mkdir orderer
	mkdir channels
	
up :
	docker exec ca-client bash -c 'cd ./scripts && ./gen-certs.sh'
	docker cp ca-client:etc/hyperledger/fabric-ca-client/scripts/crypto-config ./crypto-config
<<<<<<< HEAD
	../bin/exe/configtxgen -profile OrdererGenesis -channelID syschannel -outputBlock ./orderer/genesis.block 
	../bin/exe/configtxgen -profile MainChannel -outputCreateChannelTx ./channels/mainchannel.tx -channelID mainchannel 
	../bin/exe/configtxgen -profile MainChannel -outputAnchorPeersUpdate ./channels/org1-anchors.tx -channelID mainchannel -asOrg org1 
	../bin/exe/configtxgen -profile MainChannel -outputAnchorPeersUpdate ./channels/org2-anchors.tx -channelID mainchannel -asOrg org2
	../bin/exe/configtxgen -profile MainChannel -outputAnchorPeersUpdate ./channels/org3-anchors.tx -channelID mainchannel -asOrg org3
=======
	../bin/nicks/configtxgen -profile OrdererGenesis -channelID syschannel -outputBlock ./orderer/genesis.block 
	../bin/nicks/configtxgen -profile MainChannel -outputCreateChannelTx ./channels/mainchannel.tx -channelID mainchannel 
	../bin/nicks/configtxgen -profile MainChannel -outputAnchorPeersUpdate ./channels/org1-anchors.tx -channelID mainchannel -asOrg org1 
	../bin/nicks/configtxgen -profile MainChannel -outputAnchorPeersUpdate ./channels/org2-anchors.tx -channelID mainchannel -asOrg org2
	../bin/nicks/configtxgen -profile MainChannel -outputAnchorPeersUpdate ./channels/org3-anchors.tx -channelID mainchannel -asOrg org3
>>>>>>> master
	docker-compose up

join :
	docker exec cli-peer0-org1 bash -c 'peer channel create -c mainchannel -f ./channels/mainchannel.tx -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/ca-root-7054.pem'
	docker exec cli-peer0-org1 bash -c 'peer channel join -b mainchannel.block' 
	docker exec cli-peer0-org1 bash -c 'cp mainchannel.block ./channels/mainchannel.block' 
	docker exec cli-peer1-org1 bash -c 'peer channel join -b ./channels/mainchannel.block' 
	docker exec cli-peer0-org2 bash -c 'peer channel join -b ./channels/mainchannel.block' 
	docker exec cli-peer1-org2 bash -c 'peer channel join -b ./channels/mainchannel.block'
	docker exec cli-peer0-org3 bash -c 'peer channel join -b ./channels/mainchannel.block'
	docker exec cli-peer1-org3 bash -c 'peer channel join -b ./channels/mainchannel.block'
	docker exec cli-peer0-org1 bash -c 'peer channel update -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/ca-root-7054.pem -c mainchannel -f ./channels/org1-anchors.tx' 
	docker exec cli-peer0-org2 bash -c 'peer channel update -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/ca-root-7054.pem -c mainchannel -f ./channels/org2-anchors.tx'
	docker exec cli-peer0-org3 bash -c 'peer channel update -o orderer0-service:7050 --tls --cafile=/etc/hyperledger/orderers/msp/tlscacerts/ca-root-7054.pem -c mainchannel -f ./channels/org3-anchors.tx' 
	
stop :
	docker stop $$(docker ps -a -q)

ca :
	docker-compose -f docker-compose-ca.yaml up

