"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { tryLogin } from "./actions";
import { pbkdf2Sync, pseudoRandomBytes } from "crypto";
import aesjs from "aes-js";
import bcrypt from "bcryptjs";

export const registerFormSchema = z.object({
  alias: z.string().min(3).max(20).optional(),
  username: z.string().min(3).max(20),
  password: z.string().min(8).max(100),
});
export default function RegisterForm() {
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
  });
  async function onSubmit(values: z.infer<typeof registerFormSchema>) {

    // create derived key from password
    const pw = values.password;
    const salt = pseudoRandomBytes(64);
    const out_key = pbkdf2Sync(pw, salt, 4, 32, "sha512");
    // now generate random bytes for content key
    const content_key = pseudoRandomBytes(32);
    // encrypt content key with derived key
    const iv = pseudoRandomBytes(16);
    const cbc = new aesjs.ModeOfOperation.cbc(out_key, iv)
    const enc_content_key = cbc.encrypt(content_key);
    const enc_ck_hex = aesjs.utils.hex.fromBytes(enc_content_key)

    // encrypt password for server
    const enc_pw = bcrypt.hashSync(pw, values.username);
    const data = await tryLogin({ ...values, password: enc_pw, content_key: enc_ck_hex });
    console.log("server response:", data);
  }

  return (
    <Form {...form}>
      <form
        className="w-full flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input className="text-black" placeholder="admin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="alias"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alias</FormLabel>
              <FormControl>
                <Input className="text-black" placeholder="Amelia" {...field} />
              </FormControl>
              <FormDescription>
                This is your display name, it can be changed later.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  className="text-black"
                  placeholder="xyz"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mr-auto">
          <Button className="bg-pink-600 hover:bg-pink-400" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
