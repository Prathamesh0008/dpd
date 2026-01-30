import { parseStringPromise } from "xml2js";

/* ------------------ helpers ------------------ */

function escapeXml(v = "") {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildAuthHeader() {
  return `
  <ns:authentication xmlns:ns="http://dpd.com/common/service/types/Authentication/2.0">
    <delisId>${escapeXml(process.env.DPD_DELIS_ID)}</delisId>
    <authToken>${escapeXml(process.env.DPD_AUTH_TOKEN)}</authToken>
    <messageLanguage>${escapeXml(process.env.DPD_MESSAGE_LANGUAGE || "en_EN")}</messageLanguage>
  </ns:authentication>`;
}

function buildOrderXml({ sender, recipient, sendingDepot, product }) {
  return `
  <order>
    <generalShipmentData>
      <sendingDepot>${escapeXml(sendingDepot)}</sendingDepot>
      <product>${escapeXml(product)}</product>

      <sender>
        <name1>${escapeXml(sender.name1)}</name1>
        <street>${escapeXml(sender.street)}</street>
        <country>${escapeXml(sender.country)}</country>
        <zipCode>${escapeXml(sender.zipCode)}</zipCode>
        <city>${escapeXml(sender.city)}</city>
      </sender>

      <recipient>
        <name1>${escapeXml(recipient.name1)}</name1>
        <street>${escapeXml(recipient.street)}</street>
        <country>${escapeXml(recipient.country)}</country>
        <zipCode>${escapeXml(recipient.zipCode)}</zipCode>
        <city>${escapeXml(recipient.city)}</city>
      </recipient>
    </generalShipmentData>

    <parcels>
      <weight>${escapeXml(sender.weight || "1")}</weight>
    </parcels>

    <productAndServiceData>
      <orderType>consignment</orderType>
    </productAndServiceData>
  </order>`;
}

async function soapCall(url, bodyXml) {
  const envelope = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:ns1="http://dpd.com/common/service/types/ShipmentService/3.5">
  <soapenv:Header>
    ${buildAuthHeader()}
  </soapenv:Header>
  <soapenv:Body>
    ${bodyXml}
  </soapenv:Body>
</soapenv:Envelope>`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/xml; charset=utf-8" },
    body: envelope,
  });

  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}

function deepFind(obj, key) {
  if (!obj || typeof obj !== "object") return null;
  if (obj[key]) return obj[key];
  for (const k of Object.keys(obj)) {
    const found = deepFind(obj[k], key);
    if (found != null) return found;
  }
  return null;
}

function readBool(node) {
  if (node === true || node === "true") return true;
  if (node && typeof node === "object" && node._ === "true") return true;
  return false;
}

function readString(node) {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (typeof node === "object" && node._) return node._;
  return "";
}

/* ------------------ API calls ------------------ */

export async function validateOrders(payload) {
  const orderXml = buildOrderXml(payload);
  const body = `<ns1:validateOrders>${orderXml}</ns1:validateOrders>`;

  const { text } = await soapCall(process.env.DPD_VALIDATE_URL, body);

  const parsed = await parseStringPromise(text, {
    explicitArray: false,
    ignoreAttrs: false,
  });

  const successNode = deepFind(parsed, "success");
  const success = readBool(successNode);

  return { success, raw: text };
}

export async function storeOrders(payload) {
  const orderXml = buildOrderXml(payload);
  const body = `<ns1:storeOrders>${orderXml}</ns1:storeOrders>`;

  const { text } = await soapCall(process.env.DPD_STORE_URL, body);

  const parsed = await parseStringPromise(text, {
    explicitArray: false,
    ignoreAttrs: false,
  });

  return {
    success: readBool(deepFind(parsed, "success")),
    trackingNumber: readString(deepFind(parsed, "parcelLabelNumber")),
    mpsId: readString(deepFind(parsed, "mpsId")),
    labelBase64: readString(deepFind(parsed, "parcellabelsPDF")),
    raw: text,
  };
}
