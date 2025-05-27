import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const VerifyPage = () => {
  const router = useRouter();
  const email = router.query.email as string;

  return (    <Layout title="Verify Email">      
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-white">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-indigo-100">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
              />
            </svg>
            <h1 className="mt-4 text-2xl font-bold text-indigo-700">Check Your Email</h1>
            <p className="mt-2 text-gray-600">
              We've sent a verification link to{' '}
              <span className="font-medium text-indigo-600">{email}</span>
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Click the link in the email to verify your account and continue to the dashboard.
              The verification link will expire in 24 hours.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyPage;
