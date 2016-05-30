'use strict';

var path = require('path'),
    chai = require('chai'),
    bs58 = require('bs58'),
    compare = require('buffer-compare');

var expect = chai.expect;

var addressFactory = require(path.resolve(__dirname, '../lib/address.js'));

describe('When i have a Bitcoin configuration for multichain (address-pubkeyhash-version=00, address-scripthash-version=05, private-key-version=80, address-checksum-value=00000000)', function() {

    var pubKeyHashVersion = '00',
        privateKeyVersion = '05',
        checksumValue = '00';

    describe('And i generate an address', function() {

        var address;

        before(function() {
            address = addressFactory.generateNew(pubKeyHashVersion, checksumValue);
            console.log('address');
        });

        it('should have a 32-byte private key', function() {
            expect(Buffer.isBuffer(address.privateKey)).to.be.true;
            expect(address.privateKey).to.have.length(32);
        });

        it('should have a public key', function() {
            expect(Buffer.isBuffer(address.publicKey)).to.be.true;
        });

        it('should have a base58 encoded address', function() {
            expect(address.address).to.be.a('string');
        });

        describe('When i decode the base58 encoded address', function() {

            var decodedAddress;

            before(function() {
                decodedAddress = new Buffer(bs58.decode(address.address));
            });

            it('should have a length of 22 bytes (1 version byte + 20 byte ripemd160 hash + 1 checksum byte)', function() {
                expect(decodedAddress).to.have.length(22);
            });

            it('should start with the public key hash version 00', function() {
                expect(decodedAddress.toString('hex').slice(0, 2)).to.equal('00');
            });

        });

        describe('When i generate the WIF format of this address', function() {

            var addressWIF;

            before(function() {
                addressWIF = address.toWIF(privateKeyVersion, checksumValue);
            });

            it('should return a base58 encoded WIF', function() {
                expect(addressWIF).to.be.a('string');
            });

            describe('When i decode the base58 encoded address', function() {

                var decodedWIF;

                before(function() {
                    decodedWIF = new Buffer(bs58.decode(addressWIF));
                });

                it('should start with the private key version 05', function() {
                    expect(decodedWIF.toString('hex').slice(0, 2)).to.equal('05');
                });

                it('should include the private key and a 1 byte checksum', function() {
                    var hexValue = decodedWIF.toString('hex');
                    expect(hexValue.slice(2, hexValue.length - 2)).to.equal(address.privateKey.toString('hex'));
                });

                describe('When i create the address from the generated WIF', function() {

                    var addressByWIF;

                    before(function() {
                        addressByWIF = addressFactory.fromWIF(addressWIF, pubKeyHashVersion, privateKeyVersion, checksumValue);
                    });

                    it('should match the original address', function() {
                        expect(addressByWIF.address).to.equal(address.address);
                        expect(compare(addressByWIF.privateKey, address.privateKey)).to.equal(0);
                        expect(compare(addressByWIF.publicKey, address.publicKey)).to.equal(0);
                    });

                });

            });

        });

    });

});