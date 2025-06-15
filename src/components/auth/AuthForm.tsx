
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const authSchema = z.object({
  email: z.string().email({ message: "請輸入有效的電子郵件地址" }),
  password: z.string().min(6, { message: "密碼至少需要 6 個字元" }),
});

type AuthFormValues = z.infer<typeof authSchema>;

export function AuthForm() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSignIn = async (data: AuthFormValues) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast({
        title: "登入失敗",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "登入成功",
        description: "歡迎回來！",
      });
      navigate("/admin");
    }
    setLoading(false);
  };
  
  const onSignUp = async () => {
    setLoading(true);
    const { email, password } = form.getValues();

    const { error: validationError } = authSchema.safeParse({ email, password });
    if (validationError) {
        validationError.errors.forEach((err) => {
            toast({ title: "輸入錯誤", description: err.message, variant: "destructive" });
        });
        setLoading(false);
        return;
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${window.location.origin}/`,
        },
    });

    setLoading(false);

    if (error) {
        toast({
            title: "註冊失敗",
            description: error.message,
            variant: "destructive",
        });
    } else {
        toast({
            title: "註冊成功",
            description: "請檢查您的電子郵件以驗證您的帳戶。",
        });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSignIn)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>電子郵件</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>密碼</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            登入
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={onSignUp} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            註冊
          </Button>
        </div>
      </form>
    </Form>
  );
}
