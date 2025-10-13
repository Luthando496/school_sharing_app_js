import { Users, Book, Heart, Target, Globe, Award } from 'lucide-react';

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      bio: "Education enthusiast with 10+ years in edtech",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300"
    },
    {
      name: "Maria Rodriguez",
      role: "Head of Content",
      bio: "Former teacher passionate about resource sharing",
      image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300"
    },
    {
      name: "James Chen",
      role: "Lead Developer",
      bio: "Full-stack developer focused on educational platforms",
      image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300"
    },
    {
      name: "Sarah Williams",
      role: "Community Manager",
      bio: "Connects students and fosters collaboration",
      image: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=300"
    }
  ];

  const stats = [
    { icon: <Book size={24} />, value: "5000+", label: "Resources Shared" },
    { icon: <Users size={24} />, value: "10,000+", label: "Active Users" },
    { icon: <Globe size={24} />, value: "50+", label: "Countries" },
    { icon: <Award size={24} />, value: "98%", label: "Satisfaction Rate" }
  ];

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section */}
      <section className="header_img bg-cover bg-center min-h-[50vh] flex items-center">
        <div className="px-4 mx-auto max-w-7xl text-center py-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold primary-text mb-6">About Resource Hub</h1>
          <p className="text-lg md:text-xl lg:text-2xl secondary-text mb-8">Empowering students through shared knowledge and collaboration</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold primary-text mb-4">Our Mission</h2>
            <p className="text-lg secondary-text max-w-3xl mx-auto">
              To create a global community where students can share knowledge, resources, and support 
              each other's academic journey through collaborative learning.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-bg p-6 rounded-lg shadow-lg text-center border border-primary">
              <div className="flex justify-center mb-4">
                <Target className="text-accent" size={40} />
              </div>
              <h3 className="text-xl font-semibold primary-text mb-2">Our Vision</h3>
              <p className="secondary-text">
                To become the world's most trusted platform for student resource sharing, 
                breaking down barriers to education.
              </p>
            </div>
            
            <div className="card-bg p-6 rounded-lg shadow-lg text-center border border-primary">
              <div className="flex justify-center mb-4">
                <Heart className="text-accent" size={40} />
              </div>
              <h3 className="text-xl font-semibold primary-text mb-2">Our Values</h3>
              <p className="secondary-text">
                Collaboration, integrity, accessibility, and innovation drive everything we do 
                to support student success.
              </p>
            </div>
            
            <div className="card-bg p-6 rounded-lg shadow-lg text-center border border-primary">
              <div className="flex justify-center mb-4">
                <Users className="text-accent" size={40} />
              </div>
              <h3 className="text-xl font-semibold primary-text mb-2">Our Community</h3>
              <p className="secondary-text">
                We believe in the power of community-driven learning where every student 
                can both learn and teach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold primary-text text-center mb-12">By The Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="card-bg p-6 rounded-lg shadow-lg text-center border border-primary">
                <div className="flex justify-center mb-3 text-accent">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold primary-text mb-1">{stat.value}</h3>
                <p className="secondary-text">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold primary-text text-center mb-4">Our Team</h2>
          <p className="text-lg secondary-text text-center mb-12 max-w-3xl mx-auto">
            Meet the passionate individuals working to make educational resources accessible to all students
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="card-bg rounded-lg shadow-lg overflow-hidden border border-primary">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold primary-text">{member.name}</h3>
                  <p className="secondary-text font-medium mb-2">{member.role}</p>
                  <p className="secondary-text text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold primary-text mb-6">Join Our Community</h2>
          <p className="text-lg secondary-text mb-8 max-w-2xl mx-auto">
            Become part of a growing network of students helping each other succeed through shared knowledge and resources.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-btn font-semibold py-3 px-8 rounded-lg text-lg duration-300 cursor-pointer">
              Sign Up Now
            </button>
            <button className="bg-btn-secondary font-semibold py-3 px-8 rounded-lg text-lg duration-300 cursor-pointer border border-primary">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}