"use client";

import { decryptContentKey } from "@/lib/crypto";
import { ContentKey, DerivedPw } from "@/lib/state/key";
import { useAtom } from "jotai";
import aesjs from "aes-js";
import { redirect } from "next/navigation";
import { useEffect } from "react";

// primary use of this component is to confirm that the user has derived key in memory
export function KeyChecker({ tokens }: { tokens: UserTokens }) {
  const { content_key, content_iv } = tokens;
  const [derived_key, _1] = useAtom(DerivedPw);
  const [_, setConKey] = useAtom(ContentKey)
  useEffect(() => {
    if (!derived_key?.length) return;
    const content_key_arr = aesjs.utils.hex.toBytes(content_key);
    const decrypt_ckey = decryptContentKey(content_key_arr, content_iv, derived_key)
    setConKey(decrypt_ckey)

  }, [setConKey, derived_key, content_key, content_iv])
  return <></>
}
