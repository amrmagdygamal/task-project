import Link from 'next/link';
import Layout from '../components/Layout';
import Image from 'next/image';

const SignupRolePage = () => {
  return (
    <Layout title="Sign Up">
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-indigo-700 mb-2">Join Our Platform</h1>
            <p className="text-gray-600">Choose how you want to use our platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admin/Seller Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-4">
                <div className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
                  <Image
                    src="/window.svg"
                    alt="Seller icon"
                    width={32}
                    height={32}
                    className="text-indigo-600"
                  />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Seller Account</h2>
                <p className="text-gray-600 text-sm mb-4">Perfect for venue owners and managers</p>
              </div>
              
              <ul className="space-y-2 mb-6 text-sm">
                <li className="fl-ro-ce-sttext-gray-600">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  List and manage your venues
                </li>
                <li className="fl-ro-ce-sttext-gray-600">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Track bookings and revenue
                </li>
                <li className="fl-ro-ce-sttext-gray-600">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Manage venue availability
                </li>
              </ul>

              <Link 
                href="/signup/admin"
                className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-center font-medium rounded-lg shadow-sm transition-colors duration-200"
              >
                Sign up as Seller
              </Link>
            </div>

            {/* User/Booker Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-4">
                <div className="inline-block p-3 bg-gray-100 rounded-full mb-4">
                  <Image
                    src="/globe.svg"
                    alt="User icon"
                    width={32}
                    height={32}
                    className="text-gray-600"
                  />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">User Account</h2>
                <p className="text-gray-600 text-sm mb-4">Perfect for those looking to book venues</p>
              </div>

              <ul className="space-y-2 mb-6 text-sm">
                <li className="fl-ro-ce-sttext-gray-600">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Browse available venues
                </li>
                <li className="fl-ro-ce-sttext-gray-600">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Make and manage bookings
                </li>
                <li className="fl-ro-ce-sttext-gray-600">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Review your experiences
                </li>
              </ul>

              <Link 
                href="/signup/user"
                className="block w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white text-center font-medium rounded-lg shadow-sm transition-colors duration-200"
              >
                Sign up as User
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignupRolePage;
