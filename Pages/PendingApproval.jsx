import React from 'react';
import { User as UserEntity } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Clock, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PendingApproval() {
  const handleLogout = async () => {
    await UserEntity.logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-lg text-center shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-800">Account Pending Approval</CardTitle>
            <CardDescription className="text-slate-600 text-base pt-2">
              Your account has been created successfully, but you need an administrator's approval to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <p className="text-blue-800 font-medium">Please contact your department head or system administrator.</p>
                </div>
            </div>
            <p className="text-sm text-slate-500">
              Once your account is approved, you will be able to access the dashboard and all features. You can logout and check back later.
            </p>
            <Button onClick={handleLogout} variant="destructive" className="w-full sm:w-auto">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}