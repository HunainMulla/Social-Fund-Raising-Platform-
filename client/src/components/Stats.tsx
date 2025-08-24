
import { TrendingUp, Users, DollarSign, Heart } from "lucide-react";

const Stats = () => {
  const stats = [
    {
      icon: DollarSign,
      value: "$2.4L",
      label: "Total Raised",
      color: "text-green-600"
    },
    {
      icon: Users,
      value: "152+",
      label: "Community Members",
      color: "text-blue-600"
    },
    {
      icon: TrendingUp,
      value: "12",
      label: "Active Campaigns",
      color: "text-purple-600"
    },
    {
      icon: Heart,
      value: "89%",
      label: "Success Rate",
      color: "text-red-500"
    }
  ];

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Making a Local Impact</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Together, we're building stronger communities one campaign at a time
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 ${stat.color}`}>
                <stat.icon className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;
