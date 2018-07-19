var fs = require('fs');
var util = require('util');

var Client = require('tiesdb-client');

var Connection = Client.Connection;
var uuidv4 = require('uuid/v4');
var bigdecimal = Client.BD;
var Record = Client.Record;

(async function(err, data) {
    if (err)
        throw err;
    // var data = Buffer.from("1254494542f6ec8102a142f0e142ebe140a5808f636c69656e742d6465762e746573748289616c6c5f7479706573868601643cb283f98881018ca0c28c2e8c3a478e0f5ee9ad7a3b3ea3df4e7b38bad7888077610a0f76247aa7578e813cfc94ae65baf610bad3f0d71aa3c3a8110c2d62cbeb19fec1787f00e54a584934e141f24cb8d004c8445a17d6a0092d4b9d8c964714788cbc2f7a40d3de6d2824c9e9ec01b55685c027285be5a8ec54b35683bca56612d65125d14240d1ac8082496482847575696484a0ab41a66b7f5bf1179ddb912f0cf3e177217e1e8e0bc7050d675a371616a88b6bd1b380876642696e617279828662696e61727984a0a6e44f0ec03e1cae0ec12257c1e3f138414ae15d8411cab181cd675be2d3086ad1b5808866426f6f6c65616e8287626f6f6c65616e84a0a73f698893fe67e40289d00c99086452b0a1c6dda37d32aac7ee578759883614d1b5808866446563696d616c8287646563696d616c84a03a8bc920c149d7267404c5e843cc0bd72e20d4cceec7c47cbd5bba428ad76f82d1b3808766446f75626c658286646f75626c6584a0f9f8eb9596b70ad4e8bb06b82935ba3255a30a1a336ab04a563232125c92132bd1b78089664475726174696f6e82886475726174696f6e84a08bbc6444b06c9bd50fd55b47ae2fb508494a8cce89f85e86bea9d287efd7f8bed1b1808666466c6f61748285666c6f617484a0865bc28e072cc92c200f7793cf4a9acc990719e2cb85572ea2ca2850fdbda8dbd1b5808866496e74656765728287696e746567657284a0219d33e0c6d763de1970b197181c1ae549a5115513634cff4e7f00365374d194d1af8085664c6f6e6782846c6f6e6784a07f61382310dbb61a74fc86c0429e9a807ff5e52fe4a6250f1a032717a23da5f5d1b3808766537472696e678286737472696e6784a0d296d9102a76b612328202bbdf151287db390c94142df56e5a1fba0d4c73c492d1af80856654696d65828474696d6584a0a25503f039e3b843110b7ca41743228133244322bce95ce8230bf4da3cbe77ccc180", 'hex');
    //
    //
    // var req = codec.decode(data, new Buffer("fafe9c9e7845f446d091c12c74d44c61a0923c00", "hex"));
    //
    //
    // console.log(util.inspect(req, {showHidden: false, depth: null}));
    // return;
    //data = codec.encode(req);
    //console.log(data.toString('hex'));

    let types = {
        Id: 'uuid',
        fBinary: 'binary',
        fBoolean: 'boolean',
        fDecimal: 'decimal',
        fDouble: 'double',
        fDuration: 'duration',
        fFloat: 'float',
        fInteger: 'integer',
        fLong: 'long',
        fString: 'string',
        fTime: 'time'
    };

    let record = new Record('client-dev.test', 'all_types');
    let uuid = uuidv4();
    record.putFields({
        Id: uuid,
        fBinary: new Buffer("e0a61e5ad74f", 'hex'),
        fBoolean: false,
        fDecimal: new bigdecimal.BigDecimal("-1.235e-8"),
        fDouble: 158.234e200,
        fDuration: 20*86400,
        fFloat: -42803.234e-8,
        fInteger: 423424432,
        fLong: -278374928374,
        fString: "This is UTF-8 строка",
        fTime: new Date()
    }, types);

    //0xe0a61e5ad74fc154927e8412c7f03528134f755e7eb45554eb7a99c2744ac34e
    //0xAe65bAf610Bad3F0d71Aa3C3a8110c2d62cbEb19

    let c = new Connection();
    await c.connect('ws://192.168.1.45:8080/websocket');

    let response = await c.modify([record], Buffer.from('e0a61e5ad74fc154927e8412c7f03528134f755e7eb45554eb7a99c2744ac34e', 'hex'));

    let records = await c.recollect(
        `SELECT * /* 
            Id,
            CAST(fDuration as duration) as dur,
            CAST(writeTime(fTime) as date)::time as wtime,
            CAST(writeTime(fTime) AS date) as dt, 
            fLong,
            bigIntAsBlob(toUnixTimestamp(CAST(writeTime(fTime) AS date))) AS WriteTime, 
            intAsBlob(0x309) AS TestValue */
        FROM "client-dev.test"."all_types"
        WHERE
            Id IN (${uuid.toString()})`
    );

    let val = records[0].getValue("fLong");

    records[0].putValue("fLong", val + 123, types.fLong);

    response = await c.modify(records, Buffer.from('e0a61e5ad74fc154927e8412c7f03528134f755e7eb45554eb7a99c2744ac34e', 'hex'));

    console.log(util.inspect(response, {showHidden: false, depth: null}));

    c.close();
    
})();