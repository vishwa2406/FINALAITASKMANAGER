import React, { useState, useEffect } from 'react'
import { useAuth } from '../../controller/context/AuthContext'
import { FiUser, FiMail, FiShield, FiCalendar, FiCheckSquare, FiTrendingUp, FiLogOut } from 'react-icons/fi'
import api from '../../controller/api'
import { PageSpinner } from '../components/common/Spinner'

export default function ProfilePage() {
  const { user, logout }    = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => setProfile(data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageSpinner />

  const StatItem = ({ icon: Icon, label, value, color }) => (
    <div className={`flex items-center gap-4 p-4 rounded-xl ${color}`}>
      <Icon size={22} />
      <div>
        <p className="text-2xl font-bold">{value ?? 0}</p>
        <p className="text-sm opacity-80">{label}</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-5 fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-blue-600 to-blue-800" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-blue-600 font-bold text-3xl">
              {user?.fullName?.[0]?.toUpperCase()}
            </div>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 border border-red-200 rounded-lg text-sm font-medium transition-colors">
              <FiLogOut size={15} /> Sign Out
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{profile?.fullName}</h2>
          <p className="text-gray-500 text-sm">{profile?.email}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {[
              { icon: FiMail,     text: profile?.email },
              { icon: FiShield,   text: profile?.role?.toLowerCase() || 'User' },
              { icon: FiUser,     text: profile?.fullName },
              { icon: FiCalendar, text: profile?.createdAt ? `Joined ${new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : '' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                <Icon className="text-gray-400 flex-shrink-0" size={16} />
                <span className="capitalize">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatItem icon={FiCheckSquare} label="Total Tasks"  value={profile?.totalTasks}     color="bg-blue-50 text-blue-700"  />
        <StatItem icon={FiTrendingUp}  label="Completed"   value={profile?.completedTasks} color="bg-green-50 text-green-700" />
        <StatItem icon={FiCheckSquare} label="Pending"     value={profile?.pendingTasks}   color="bg-amber-50 text-amber-700" />
      </div>

      {/* MVC Architecture info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">MVC Architecture</h3>
        <div className="space-y-3 text-sm">
          {[
            { layer: 'Model (Backend)',      desc: 'model/entity/User.java, model/enums/Role.java — JPA entities & enums', color: 'bg-blue-100 text-blue-700' },
            { layer: 'View (Backend)',        desc: 'view/dto/request/*, view/dto/response/* — JSON request/response shapes', color: 'bg-green-100 text-green-700' },
            { layer: 'Controller (Backend)', desc: 'controller/AuthController.java — routes HTTP to Service', color: 'bg-purple-100 text-purple-700' },
            { layer: 'Model (Frontend)',     desc: 'src/model/userModel.js — domain constants & validation rules', color: 'bg-blue-100 text-blue-700' },
            { layer: 'View (Frontend)',      desc: 'src/view/pages/* & view/components/* — pure presentation', color: 'bg-green-100 text-green-700' },
            { layer: 'Controller (Frontend)', desc: 'src/controller/hooks/* — useTaskController, useAuthController etc.', color: 'bg-purple-100 text-purple-700' },
          ].map(({ layer, desc, color }, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${color}`}>{layer}</span>
              <p className="text-gray-600 text-xs">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Tech Stack</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Frontend',  value: 'React + Vite'   },
            { label: 'Styling',   value: 'Tailwind CSS'   },
            { label: 'Backend',   value: 'Spring Boot'    },
            { label: 'Auth',      value: 'JWT Tokens'     },
            { label: 'Database',  value: 'MySQL'          },
            { label: 'AI',        value: 'OpenAI GPT'     },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
