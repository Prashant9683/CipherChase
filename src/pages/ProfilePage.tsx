import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { User, Edit, Award, PieChart, Clock, Save, X } from 'lucide-react';

const ProfilePage: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const { profile, loading: profileLoading, updateProfile } = useProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        display_name: '',
        bio: '',
        is_public: true
    });

    React.useEffect(() => {
        if (profile) {
            setFormData({
                display_name: profile.display_name || '',
                bio: profile.bio || '',
                is_public: profile.is_public
            });
        }
    }, [profile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData({
            ...formData,
            [name]: checked
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await updateProfile(formData);
        if (result.success) {
            setIsEditing(false);
        }
    };

    if (authLoading || profileLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (!profile) {
        return (
            <div className="max-w-4xl mx-auto py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-red-800 font-medium mb-1">Profile Not Found</h3>
                    <p className="text-red-700">Unable to load your profile information.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-serif text-[#1A3A5A] mb-6">Your Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <h2 className="text-xl font-medium">Profile</h2>
                            {!isEditing && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditing(true)}
                                    icon={<Edit size={16} />}
                                >
                                    Edit
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Display Name
                                        </label>
                                        <input
                                            type="text"
                                            name="display_name"
                                            value={formData.display_name}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bio
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_public"
                                            name="is_public"
                                            checked={formData.is_public}
                                            onChange={handleCheckboxChange}
                                            className="h-4 w-4 text-[#D4AF37] focus:ring-[#D4AF37]"
                                        />
                                        <label htmlFor="is_public" className="ml-2 text-sm text-gray-700">
                                            Public Profile
                                        </label>
                                    </div>

                                    <div className="flex space-x-2 pt-2">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="sm"
                                            icon={<Save size={16} />}
                                        >
                                            Save
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsEditing(false)}
                                            icon={<X size={16} />}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-center mb-4">
                                        <div className="h-24 w-24 rounded-full bg-[#1A3A5A] flex items-center justify-center text-white text-2xl">
                                            {profile.display_name?.charAt(0) || profile.email?.charAt(0) || '?'}
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <h3 className="text-lg font-medium">{profile.display_name || 'Anonymous Explorer'}</h3>
                                        <p className="text-gray-500 text-sm">{profile.email}</p>
                                    </div>

                                    {profile.bio && (
                                        <div className="mt-4">
                                            <p className="text-gray-700">{profile.bio}</p>
                                        </div>
                                    )}

                                    <div className="pt-2 pb-1 text-sm text-gray-500">
                                        {profile.is_public ? 'Public profile' : 'Private profile'}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <div className="grid grid-cols-1 gap-6">
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-medium flex items-center">
                                    <PieChart size={20} className="mr-2 text-[#D4AF37]" />
                                    Statistics
                                </h2>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#F5DEB3]/20 p-4 rounded-md border border-[#D4AF37]/30">
                                        <div className="text-sm text-gray-500">Hunts Completed</div>
                                        <div className="text-2xl font-bold text-[#1A3A5A]">{profile.total_hunts_completed}</div>
                                    </div>

                                    <div className="bg-[#F5DEB3]/20 p-4 rounded-md border border-[#D4AF37]/30">
                                        <div className="text-sm text-gray-500">Puzzles Solved</div>
                                        <div className="text-2xl font-bold text-[#1A3A5A]">{profile.total_puzzles_solved}</div>
                                    </div>

                                    {profile.favorite_cipher_type && (
                                        <div className="bg-[#F5DEB3]/20 p-4 rounded-md border border-[#D4AF37]/30 col-span-2">
                                            <div className="text-sm text-gray-500">Favorite Cipher Type</div>
                                            <div className="text-xl font-bold text-[#1A3A5A]">
                                                {profile.favorite_cipher_type.charAt(0).toUpperCase() + profile.favorite_cipher_type.slice(1)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-medium flex items-center">
                                    <Award size={20} className="mr-2 text-[#D4AF37]" />
                                    Achievements
                                </h2>
                            </CardHeader>
                            <CardContent>
                                {profile.achievements && profile.achievements.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {profile.achievements.map((achievement: any, index: number) => (
                                            <div key={index} className="flex items-start p-3 bg-gray-50 rounded-md border border-gray-200">
                                                <div className="bg-[#D4AF37] text-white p-2 rounded-md mr-3">
                                                    <Award size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{achievement.title}</div>
                                                    <div className="text-sm text-gray-600">{achievement.description}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500">
                                        <Award size={40} className="mx-auto mb-3 text-gray-300" />
                                        <p>You haven't earned any achievements yet.</p>
                                        <p className="text-sm mt-1">Start solving puzzles and completing hunts to earn your first achievement!</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-medium flex items-center">
                                    <Clock size={20} className="mr-2 text-[#D4AF37]" />
                                    Recent Activity
                                </h2>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-6 text-gray-500">
                                    <Clock size={40} className="mx-auto mb-3 text-gray-300" />
                                    <p>No recent activity to display.</p>
                                    <p className="text-sm mt-1">Your recent puzzles and hunts will appear here.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;