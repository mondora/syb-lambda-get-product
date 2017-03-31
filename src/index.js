import "babel-polyfill";
import https from "https";
import R from "ramda";

exports.handler = function(event, context, callback) {
    console.log("Received event:", JSON.stringify(event, null, 2));
    console.log("Received context:", JSON.stringify(context, null, 2));

    // if no SKU code on params, set to start-your-business sku
    const sku = event.params.querystring.sku ? event.params.querystring.sku : "SKU-00000059";

    https.get({
        hostname: `rest.${event["stage-variables"].zuoraHost}`,
        path: "/v1/catalog/products",
        headers: event["stage-variables"]
    }, res => {

        let rawData = "";
        res.on("data", data => {
            rawData += data;
        });
        res.on("end", () => {
            console.log("Received data:", rawData);
            const dataJson = JSON.parse(rawData);
            callback(null, R.find(R.propEq("sku", sku))(dataJson.products));
        });

    }).on("error", e => {
        console.error(e);
        callback(null, {});
    });
};
