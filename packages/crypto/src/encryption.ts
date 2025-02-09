/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2023 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import {
  crypto_aead_xchacha20poly1305_ietf_encrypt,
  crypto_secretstream_xchacha20poly1305_init_push,
  crypto_secretstream_xchacha20poly1305_push,
  randombytes_buf,
  crypto_aead_xchacha20poly1305_ietf_NPUBBYTES,
  crypto_secretstream_xchacha20poly1305_TAG_FINAL,
  crypto_secretstream_xchacha20poly1305_TAG_MESSAGE,
  to_base64,
  from_base64,
  base64_variants,
  StateAddress
} from "libsodium-wrappers";
import KeyUtils from "./keyutils";
import {
  Cipher,
  EncryptionKey,
  OutputFormat,
  Plaintext,
  SerializedKey
} from "./types";

const encoder = new TextEncoder();
export default class Encryption {
  private static transformInput(plaintext: Plaintext): Uint8Array {
    let data: Uint8Array | null = null;
    if (typeof plaintext.data === "string" && plaintext.format === "base64") {
      data = from_base64(plaintext.data, base64_variants.ORIGINAL);
    } else if (typeof plaintext.data === "string") {
      data = encoder.encode(plaintext.data);
    } else if (plaintext.data instanceof Uint8Array) {
      data = plaintext.data;
    }
    if (!data) throw new Error("Data cannot be null.");
    return data;
  }

  static encrypt(
    key: SerializedKey,
    plaintext: Plaintext,
    outputFormat: OutputFormat = "uint8array"
  ): Cipher {
    const encryptionKey = KeyUtils.transform(key);
    const data = this.transformInput(plaintext);

    const nonce = randombytes_buf(crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);

    const cipher: string | Uint8Array =
      crypto_aead_xchacha20poly1305_ietf_encrypt(
        data,
        null,
        null,
        nonce,
        encryptionKey.key
      );

    let output: string | Uint8Array = cipher;
    if (outputFormat === "base64") {
      output = to_base64(cipher, base64_variants.URLSAFE_NO_PADDING);
    }

    const iv = to_base64(nonce);
    return {
      format: outputFormat,
      alg: getAlgorithm(base64_variants.URLSAFE_NO_PADDING),
      cipher: output,
      iv,
      salt: encryptionKey.salt,
      length: data.length
    };
  }

  static createStream(key: SerializedKey): EncryptionStream {
    return new EncryptionStream(KeyUtils.transform(key));
  }
}

class EncryptionStream {
  state: StateAddress;
  header: string;
  constructor(key: EncryptionKey) {
    const { state, header } = crypto_secretstream_xchacha20poly1305_init_push(
      key.key,
      "base64"
    );
    this.state = state;
    this.header = header;
  }

  write(chunk: Uint8Array, final?: boolean): Uint8Array {
    return crypto_secretstream_xchacha20poly1305_push(
      this.state,
      chunk,
      null,
      final
        ? crypto_secretstream_xchacha20poly1305_TAG_FINAL
        : crypto_secretstream_xchacha20poly1305_TAG_MESSAGE
    );
  }
}

function getAlgorithm(base64Variant: base64_variants) {
  //Template: encryptionAlgorithm-kdfAlgorithm-base64variant
  return `xcha-argon2i13-${base64Variant}`;
}
