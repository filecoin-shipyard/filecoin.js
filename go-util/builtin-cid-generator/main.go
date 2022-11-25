package main

import (
	"encoding/hex"
	"fmt"
	"strings"

	"github.com/ipfs/go-cid"
	"github.com/multiformats/go-multihash"
	mh "github.com/multiformats/go-multihash"
	"golang.org/x/xerrors"
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

func mainOld() {
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

const (
	EthAddressLength = 20
	EthHashLength    = 32
)

type EthHash [EthHashLength]byte
type EthBytes []byte

func EthHashFromCid(c cid.Cid) (EthHash, error) {
	return EthHashFromHex(c.Hash().HexString()[8:])
}

func EthHashFromHex(s string) (EthHash, error) {
	handlePrefix(&s)
	b, err := decodeHexString(s, EthHashLength)
	if err != nil {
		return EthHash{}, err
	}
	var h EthHash
	copy(h[EthHashLength-len(b):], b)
	return h, nil
}

func handlePrefix(s *string) {
	if strings.HasPrefix(*s, "0x") || strings.HasPrefix(*s, "0X") {
		*s = (*s)[2:]
	}
	if len(*s)%2 == 1 {
		*s = "0" + *s
	}
}

func decodeHexString(s string, length int) ([]byte, error) {
	b, err := hex.DecodeString(s)

	if err != nil {
		return []byte{}, xerrors.Errorf("cannot parse hash: %w", err)
	}

	if len(b) > length {
		return []byte{}, xerrors.Errorf("length of decoded bytes is longer than %d", length)
	}

	return b, nil
}

func main() {
	targetCid := "bafy2bzaceakw6vvxudgtws6mevvaxft6vum3pqpktpoqp6ovwvykfyg2wzzhi"
	c, _ := cid.Decode(targetCid)
	eh, _ := EthHashFromCid(c)

	h := []byte{}
	for k := range eh {
		h = append(h, eh[k])
	}

	s := hex.EncodeToString(h)
	if len(s)%2 == 1 {
		s = "0" + s
	}

	targetTxHash := "156f56b7a0cd3b4bcc256a0b967ead19b7c1ea9bdd07f9d5b570a2e0dab67274"
	fmt.Println("tx hash")
	fmt.Println(targetTxHash)
	fmt.Println(s)

	//go from string to eh
	txHashHex, _ := hex.DecodeString(targetTxHash)

	mh, _ := multihash.EncodeName(txHashHex, "blake2b-256")
	c2 := cid.NewCidV1(cid.DagCBOR, mh)

	fmt.Println("tx cid")
	fmt.Println(txHashHex)
	fmt.Println(c2)
	fmt.Println(targetCid)

}
