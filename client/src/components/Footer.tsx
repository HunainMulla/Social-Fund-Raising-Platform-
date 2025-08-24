
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
           
              <div>
                <h3 className="text-lg font-bold">LocalFund</h3>
                <p className="text-xs text-gray-400">Community Crowdfunding</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering local communities to fund the causes that matter most.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Campaigners</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Start a Campaign</a></li>
              <li><a href="#" className="hover:text-white">Success Stories</a></li>
              <li><a href="#" className="hover:text-white">Campaign Tips</a></li>
              <li><a href="#" className="hover:text-white">Fees & Pricing</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Backers</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">How It Works</a></li>
              <li><a href="#" className="hover:text-white">Trust & Safety</a></li>
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Community Guidelines</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                hunainmulla161@gmail.com
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                +91 7775032268
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 LocalFund. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
