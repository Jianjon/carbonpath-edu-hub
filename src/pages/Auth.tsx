
import { AuthForm } from "@/components/auth/AuthForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from '@/components/Navigation';

const AuthPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold tracking-tight">管理員登入</CardTitle>
              <CardDescription>
                請登入以存取管理後台。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
