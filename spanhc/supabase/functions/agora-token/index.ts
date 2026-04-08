import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function uint32ToBytes(value: number): Uint8Array {
  const bytes = new Uint8Array(4);
  bytes[3] = value & 0xff;
  bytes[2] = (value >> 8) & 0xff;
  bytes[1] = (value >> 16) & 0xff;
  bytes[0] = (value >> 24) & 0xff;
  return bytes;
}

function packUint16(value: number): Uint8Array {
  const bytes = new Uint8Array(2);
  bytes[1] = value & 0xff;
  bytes[0] = (value >> 8) & 0xff;
  return bytes;
}

function packString(str: string): Uint8Array {
  const encoded = new TextEncoder().encode(str);
  const len = packUint16(encoded.length);
  const result = new Uint8Array(2 + encoded.length);
  result.set(len, 0);
  result.set(encoded, 2);
  return result;
}

function concatArrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

async function buildToken(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: number,
  expireTimestamp: number
): Promise<string> {
  const version = "006";
  const ts = Math.floor(Date.now() / 1000);
  const salt = Math.floor(Math.random() * 0xffffffff);

  const uidStr = uid === 0 ? "" : uid.toString();

  const message = concatArrays(
    uint32ToBytes(1),
    uint32ToBytes(ts),
    uint32ToBytes(salt),
    uint32ToBytes(expireTimestamp),
    packString(appId),
    packString(channelName),
    packString(uidStr),
  );

  const key = new TextEncoder().encode(appCertificate);
  const cryptoKey = await crypto.subtle.importKey(
    "raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, message);
  const sigBytes = new Uint8Array(signature);

  const content = concatArrays(
    packString(new TextDecoder().decode(sigBytes)),
    uint32ToBytes(ts),
    uint32ToBytes(salt),
    uint32ToBytes(expireTimestamp),
    packString(appId),
    packString(channelName),
    packString(uidStr),
  );

  const token = version + btoa(String.fromCharCode(...content));
  return token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { channelName, uid } = await req.json();

    const appId = Deno.env.get("AGORA_APP_ID")!;
    const appCertificate = Deno.env.get("AGORA_APP_CERTIFICATE")!;

    const expireTimestamp = Math.floor(Date.now() / 1000) + 3600;

    const token = await buildToken(
      appId,
      appCertificate,
      channelName,
      uid ?? 0,
      expireTimestamp
    );

    return new Response(JSON.stringify({ token }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});