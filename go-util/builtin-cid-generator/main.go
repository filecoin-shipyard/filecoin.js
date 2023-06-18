package main

import (
	"fmt"

	"github.com/ipfs/go-cid"
	mh "github.com/multiformats/go-multihash"
)

var builtinActors map[cid.Cid]*actorInfo

var (
	SystemActorCodeID           cid.Cid
	InitActorCodeID             cid.Cid
	CronActorCodeID             cid.Cid
	AccountActorCodeID          cid.Cid
	StoragePowerActorCodeID     cid.Cid
	StorageMinerActorCodeID     cid.Cid
	StorageMarketActorCodeID    cid.Cid
	PaymentChannelActorCodeID   cid.Cid
	MultisigActorCodeID         cid.Cid
	RewardActorCodeID           cid.Cid
	VerifiedRegistryActorCodeID cid.Cid
	CallerTypesSignable         []cid.Cid
)

type actorInfo struct {
	name   string
	signer bool
}

func main() {
	builder := cid.V1Builder{Codec: cid.Raw, MhType: mh.IDENTITY}
	builtinActors = make(map[cid.Cid]*actorInfo)

	for id, info := range map[*cid.Cid]*actorInfo{ //nolint:nomaprange
		&SystemActorCodeID:           {name: "fil/6/system"},
		&InitActorCodeID:             {name: "fil/6/init"},
		&CronActorCodeID:             {name: "fil/6/cron"},
		&StoragePowerActorCodeID:     {name: "fil/6/storagepower"},
		&StorageMinerActorCodeID:     {name: "fil/6/storageminer"},
		&StorageMarketActorCodeID:    {name: "fil/6/storagemarket"},
		&PaymentChannelActorCodeID:   {name: "fil/6/paymentchannel"},
		&RewardActorCodeID:           {name: "fil/6/reward"},
		&VerifiedRegistryActorCodeID: {name: "fil/6/verifiedregistry"},
		&AccountActorCodeID:          {name: "fil/6/account", signer: true},
		&MultisigActorCodeID:         {name: "fil/6/multisig", signer: true},
	} {
		c, err := builder.Sum([]byte(info.name))
		if err != nil {
			panic(err)
		}
		*id = c
		builtinActors[c] = info
	}

	for k, v := range builtinActors {
		fmt.Println(k, "value is", v.name)
	}

}
