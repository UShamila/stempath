import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import DashLayout from '../components/DashLayout'
import Icon from '../components/Icon'
import settingsService from '../services/settingsService'

export default function ProfilePage() {
  const { user } = useApp()
  const { userId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isOwnProfile = !userId || userId === user?.id?.toString()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (isOwnProfile) {
          // For own profile, we already have user data
          setProfile(user)
        } else {
          // Fetch public profile
          const data = await settingsService.getPublicProfile(userId)
          setProfile(data.profile)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user, userId, isOwnProfile])

  if (loading) {
    return (
      <DashLayout>
        <div className="loading-state">
          <Icon name="loader" size={24} />
          <span>Loading profile...</span>
        </div>
      </DashLayout>
    )
  }

  if (error || !profile) {
    return (
      <DashLayout>
        <div className="error-state">
          <Icon name="alert" size={24} />
          <span>{error || 'Profile not found'}</span>
        </div>
      </DashLayout>
    )
  }

  return (
    <DashLayout>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Profile Header */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 32,
          marginBottom: 24,
          textAlign: 'center'
        }}>
          <div style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--sky))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            fontWeight: 700,
            color: '#030910',
            margin: '0 auto 20px',
            fontFamily: "'Syne', sans-serif"
          }}>
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              profile.name?.split(' ').map(n => n[0]).join('').toUpperCase()
            )}
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>
            {profile.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{
              background: profile.role === 'mentor' ? 'var(--sky)' : 'var(--accent)',
              color: '#030910',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'capitalize'
            }}>
              {profile.role}
            </span>
            {profile.country && (
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>
                <Icon name="map" size={14} /> {profile.country}
              </span>
            )}
          </div>

          {profile.bio && (
            <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
              {profile.bio}
            </p>
          )}

          {isOwnProfile && (
            <button
              className="btn-outline"
              onClick={() => navigate('/settings')}
              style={{ marginTop: 20 }}
            >
              <Icon name="settings" size={16} />
              Edit Profile
            </button>
          )}
        </div>

        {/* Role-specific information */}
        {profile.role === 'student' && profile.student && (
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>
              Student Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4, display: 'block' }}>
                  Education Level
                </label>
                <span style={{ fontWeight: 500 }}>{profile.student.education_level || 'Not specified'}</span>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4, display: 'block' }}>
                  STEM Interest
                </label>
                <span style={{ fontWeight: 500 }}>{profile.student.stem_interest || 'Not specified'}</span>
              </div>
            </div>
          </div>
        )}

        {profile.role === 'mentor' && profile.mentor && (
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>
              Mentor Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4, display: 'block' }}>
                  Expertise
                </label>
                <span style={{ fontWeight: 500 }}>{profile.mentor.expertise || 'Not specified'}</span>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4, display: 'block' }}>
                  Experience
                </label>
                <span style={{ fontWeight: 500 }}>{profile.mentor.years_experience ? `${profile.mentor.years_experience} years` : 'Not specified'}</span>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4, display: 'block' }}>
                  Rating
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontWeight: 500 }}>{profile.mentor.rating || '0.0'}</span>
                  <Icon name="star" size={14} color="var(--gold)" />
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                    ({profile.mentor.review_count || 0} reviews)
                  </span>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4, display: 'block' }}>
                  Status
                </label>
                <span style={{
                  fontWeight: 500,
                  color: profile.mentor.is_approved ? 'var(--accent)' : 'var(--gold)'
                }}>
                  {profile.mentor.is_approved ? 'Approved' : 'Pending Approval'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Join date */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 24,
          textAlign: 'center'
        }}>
          <Icon name="calendar" size={20} color="var(--muted)" />
          <p style={{ color: 'var(--muted)', marginTop: 8 }}>
            Joined {new Date(profile.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </DashLayout>
  )
}