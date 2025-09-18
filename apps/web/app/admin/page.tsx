"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ProposedBrand = {
  id: string;
  name: string;
  description?: string;
  website?: string;
  submittedBy: string;
  submissionNote?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
};

type ProposedModel = {
  id: string;
  name: string;
  brandId: string;
  brandName?: string;
  submittedBy: string;
  submissionNote?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
};

type CanonicalBrand = {
  id: string;
  name: string;
  description?: string;
  website?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type CanonicalModel = {
  id: string;
  name: string;
  brandId: string;
  brandName?: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type AuditEntry = {
  id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  changedBy: string;
  changedAt: string;
  notes?: string;
};

type User = {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  isVerified: boolean;
  verificationBadge?: string;
  reputation: number;
  trustLevel: string;
  joinedAt: string;
  lastLoginAt?: string;
  _count?: {
    listings: number;
    ratings: number;
  };
};

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [proposedBrands, setProposedBrands] = useState<ProposedBrand[]>([]);
  const [proposedModels, setProposedModels] = useState<ProposedModel[]>([]);
  const [canonicalBrands, setCanonicalBrands] = useState<CanonicalBrand[]>([]);
  const [canonicalModels, setCanonicalModels] = useState<CanonicalModel[]>([]);
  const [modelAssignments, setModelAssignments] = useState<Array<{model: CanonicalModel, brand: CanonicalBrand | null}>>([]);
  const [brandSelections, setBrandSelections] = useState<Record<string, string>>({});
  const [editingItem, setEditingItem] = useState<{type: 'brand' | 'model', id: string, data: any} | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'proposed-brands' | 'proposed-models' | 'canonical-brands' | 'canonical-models' | 'model-assignments' | 'user-management'>('proposed-brands');

  // Check authentication and admin status
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/proxy/auth/profile', { cache: 'no-store' });
        if (!mounted) return;
        if (!res.ok) {
          setAuthed(false);
          router.replace('/auth/signin?next=/admin');
          return;
        }
        const user = await res.json();
        setAuthed(true);
        setIsAdmin(user.isAdmin || false);
        if (!user.isAdmin) {
          router.replace('/');
        }
      } catch {
        if (mounted) {
          setAuthed(false);
          router.replace('/auth/signin?next=/admin');
        }
      }
    })();
    return () => { mounted = false };
  }, [router]);

  // Load proposed items
  useEffect(() => {
    if (!isAdmin) return;

    const loadData = async () => {
      try {
        const [brandsRes, modelsRes, canonicalBrandsRes, canonicalModelsRes] = await Promise.all([
          fetch('/api/proxy/admin/proposed-brands'),
          fetch('/api/proxy/admin/proposed-models'),
          fetch('/api/proxy/brands'), // Assuming this endpoint exists for canonical brands
          fetch('/api/proxy/models') // Assuming this endpoint exists for canonical models
        ]);

        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          setProposedBrands(brandsData);
        }

        if (modelsRes.ok) {
          const modelsData = await modelsRes.json();
          setProposedModels(modelsData);
        }

        if (canonicalBrandsRes.ok) {
          const canonicalBrandsData = await canonicalBrandsRes.json();
          setCanonicalBrands(canonicalBrandsData);
        }

        // For now, skip canonical models as endpoint doesn't exist
        // if (canonicalModelsRes.ok) {
        //   const canonicalModelsData = await canonicalModelsRes.json();
        //   setCanonicalModels(canonicalModelsData);
        // }

          // Load model assignments for review
          if (canonicalBrandsRes.ok) {
            const brands = await canonicalBrandsRes.json();
            // For now, we'll create mock model assignments - in real implementation, 
            // you'd fetch models with their brand assignments
            const mockAssignments = [
              { 
                model: { 
                  id: '1', 
                  name: 'AirPods Pro', 
                  brandId: 'apple', 
                  description: 'Wireless earbuds',
                  status: 'APPROVED',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }, 
                brand: brands.find((b: any) => b.id === 'apple') 
              },
              { 
                model: { 
                  id: '2', 
                  name: 'Galaxy Buds', 
                  brandId: 'samsung', 
                  description: 'True wireless earbuds',
                  status: 'APPROVED',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }, 
                brand: brands.find((b: any) => b.id === 'samsung') 
              },
            ];
            setModelAssignments(mockAssignments);
          }

          // Load users for management
          const usersRes = await fetch('/api/proxy/admin/users');
          if (usersRes.ok) {
            const usersData = await usersRes.json();
            setUsers(usersData.users || []);
          }
        } catch (error) {
          console.error('Failed to load data:', error);
        }
    };

    loadData();
  }, [isAdmin]);

  const handleBrandAction = async (brandId: string, action: 'approve' | 'reject') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/admin/proposed-brands/${brandId}/${action}`, {
        method: 'POST',
      });

      if (res.ok) {
        // Refresh the list
        const brandsRes = await fetch('/api/proxy/admin/proposed-brands');
        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          setProposedBrands(brandsData);
        }
      }
    } catch (error) {
      console.error('Failed to process brand action:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModelAction = async (modelId: string, action: 'approve' | 'reject') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/admin/proposed-models/${modelId}/${action}`, {
        method: 'POST',
      });

      if (res.ok) {
        // Refresh the list
        const modelsRes = await fetch('/api/proxy/admin/proposed-models');
        if (modelsRes.ok) {
          const modelsData = await modelsRes.json();
          setProposedModels(modelsData);
        }
      }
    } catch (error) {
      console.error('Failed to process model action:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setLoading(true);
    try {
      const endpoint = editingItem.type === 'brand' 
        ? `/api/proxy/admin/proposed-brands/${editingItem.id}`
        : `/api/proxy/admin/proposed-models/${editingItem.id}`;

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem.data),
      });

      if (res.ok) {
        // Refresh the data
        const refreshRes = await fetch('/api/proxy/admin/proposed-' + editingItem.type + 's');
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          if (editingItem.type === 'brand') {
            setProposedBrands(data);
          } else {
            setProposedModels(data);
          }
        }
        setEditingItem(null);
      } else {
        console.error('Failed to update item');
      }
    } catch (error) {
      console.error('Failed to update item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModelReassignment = async (modelId: string, newBrandId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/admin/models/${modelId}/reassign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: newBrandId }),
      });

      if (res.ok) {
        // Refresh model assignments
        // In a real implementation, you'd refetch the data
        alert('Model reassigned successfully!');
      } else {
        console.error('Failed to reassign model');
      }
    } catch (error) {
      console.error('Failed to reassign model:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authed === null || !isAdmin) {
    return <div className="max-w-4xl mx-auto p-6">Loading…</div>;
  }

  if (!isAdmin) {
    return <div className="max-w-4xl mx-auto p-6">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Admin Panel</h1>

      <div className="tabs tabs-boxed mb-6">
        <a
          className={`tab ${activeTab === 'proposed-brands' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('proposed-brands')}
        >
          Proposed Brands ({proposedBrands.filter(b => b.status === 'PENDING').length})
        </a>
        <a
          className={`tab ${activeTab === 'proposed-models' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('proposed-models')}
        >
          Proposed Models ({proposedModels.filter(m => m.status === 'PENDING').length})
        </a>
        <a
          className={`tab ${activeTab === 'canonical-brands' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('canonical-brands')}
        >
          Canonical Brands ({canonicalBrands.length})
        </a>
        <a
          className={`tab ${activeTab === 'canonical-models' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('canonical-models')}
        >
          Canonical Models ({canonicalModels.length})
        </a>
        <a
          className={`tab ${activeTab === 'model-assignments' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('model-assignments')}
        >
          Model Assignments
        </a>
        <a
          className={`tab ${activeTab === 'user-management' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('user-management')}
        >
          User Management
        </a>
      </div>

      {activeTab === 'proposed-brands' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Proposed Brands</h2>
          <div className="space-y-4">
            {proposedBrands.filter(brand => brand.status === 'PENDING').map((brand) => (
              <div key={brand.id} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title">{brand.name}</h3>
                  {brand.description && <p className="text-sm text-gray-600">{brand.description}</p>}
                  {brand.website && <p className="text-sm">Website: {brand.website}</p>}
                  {brand.submissionNote && (
                    <p className="text-sm italic">Note: {brand.submissionNote}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Submitted: {new Date(brand.createdAt).toLocaleDateString()}
                  </p>
                  <div className="card-actions justify-end">
                    <button
                      className="btn btn-info btn-sm mr-2"
                      onClick={() => setEditingItem({type: 'brand', id: brand.id, data: brand})}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-success btn-sm mr-2"
                      onClick={() => handleBrandAction(brand.id, 'approve')}
                      disabled={loading}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleBrandAction(brand.id, 'reject')}
                      disabled={loading}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {proposedBrands.filter(brand => brand.status === 'PENDING').length === 0 && (
              <p className="text-center text-gray-500 py-8">No pending brand proposals</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'proposed-models' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Proposed Models</h2>
          <div className="space-y-4">
            {proposedModels.filter(model => model.status === 'PENDING').map((model) => (
              <div key={model.id} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title">{model.name}</h3>
                  {model.brandName && <p className="text-sm">Brand: {model.brandName}</p>}
                  {model.submissionNote && (
                    <p className="text-sm italic">Note: {model.submissionNote}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Submitted: {new Date(model.createdAt).toLocaleDateString()}
                  </p>
                  <div className="card-actions justify-end">
                    <button
                      className="btn btn-info btn-sm mr-2"
                      onClick={() => setEditingItem({type: 'model', id: model.id, data: model})}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-success btn-sm mr-2"
                      onClick={() => handleModelAction(model.id, 'approve')}
                      disabled={loading}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleModelAction(model.id, 'reject')}
                      disabled={loading}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {proposedModels.filter(model => model.status === 'PENDING').length === 0 && (
              <p className="text-center text-gray-500 py-8">No pending model proposals</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'canonical-brands' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Canonical Brands</h2>
          <div className="mb-4">
            <button className="btn btn-primary btn-sm">Create New Brand</button>
          </div>
          <div className="space-y-4">
            {canonicalBrands.map((brand) => (
              <div key={brand.id} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title">{brand.name}</h3>
                  {brand.description && <p className="text-sm text-gray-600">{brand.description}</p>}
                  {brand.website && <p className="text-sm">Website: {brand.website}</p>}
                  <p className="text-xs text-gray-500">
                    Status: {brand.status} | Updated: {new Date(brand.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-info btn-sm">Edit</button>
                    <button className="btn btn-secondary btn-sm">View History</button>
                  </div>
                </div>
              </div>
            ))}
            {canonicalBrands.length === 0 && (
              <p className="text-center text-gray-500 py-8">No canonical brands found</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'canonical-models' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Canonical Models</h2>
          <div className="mb-4">
            <button className="btn btn-primary btn-sm">Create New Model</button>
          </div>
          <div className="space-y-4">
            {canonicalModels.map((model) => (
              <div key={model.id} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title">{model.name}</h3>
                  {model.brandName && <p className="text-sm">Brand: {model.brandName}</p>}
                  {model.description && <p className="text-sm text-gray-600">{model.description}</p>}
                  <p className="text-xs text-gray-500">
                    Status: {model.status} | Updated: {new Date(model.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-info btn-sm">Edit</button>
                    <button className="btn btn-secondary btn-sm">View History</button>
                  </div>
                </div>
              </div>
            ))}
            {canonicalModels.length === 0 && (
              <p className="text-center text-gray-500 py-8">No canonical models found</p>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Edit {editingItem.type === 'brand' ? 'Proposed Brand' : 'Proposed Model'}
            </h3>
            <form onSubmit={handleEditSubmit} className="py-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={editingItem.data.name || ''}
                  onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, name: e.target.value}})}
                  required
                />
              </div>
              
              {editingItem.type === 'brand' && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Description</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered"
                      value={editingItem.data.description || ''}
                      onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, description: e.target.value}})}
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Website</span>
                    </label>
                    <input
                      type="url"
                      className="input input-bordered"
                      value={editingItem.data.website || ''}
                      onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, website: e.target.value}})}
                    />
                  </div>
                </>
              )}
              
              {editingItem.type === 'model' && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Description</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered"
                      value={editingItem.data.description || ''}
                      onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, description: e.target.value}})}
                    />
                  </div>
                </>
              )}
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Submission Note</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={editingItem.data.submissionNote || ''}
                  onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, submissionNote: e.target.value}})}
                />
              </div>
              
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setEditingItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Model Assignments Section */}
      {activeTab === 'model-assignments' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Model-Brand Assignments Review</h2>
          <p className="text-sm text-gray-600 mb-4">
            Review and correct model assignments to brands. This helps maintain clean canonical listings.
          </p>
          
          <div className="space-y-4">
            {modelAssignments.map(({model, brand}) => (
              <div key={model.id} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title">{model.name}</h3>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-medium">Current Brand:</p>
                      <p className="text-sm text-gray-600">{brand?.name || 'Unassigned'}</p>
                    </div>
                    <div className="flex-1">
                      <select 
                        className="select select-bordered select-sm w-full"
                        value={brandSelections[model.id] || brand?.id || ''}
                        onChange={(e) => setBrandSelections({...brandSelections, [model.id]: e.target.value})}
                      >
                        <option value="">Select new brand...</option>
                        {canonicalBrands.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="card-actions justify-end">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        const newBrandId = brandSelections[model.id];
                        if (newBrandId && newBrandId !== brand?.id) {
                          handleModelReassignment(model.id, newBrandId);
                        }
                      }}
                      disabled={loading || !brandSelections[model.id] || brandSelections[model.id] === brand?.id}
                    >
                      Update Assignment
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {modelAssignments.length === 0 && (
              <p className="text-center text-gray-500 py-8">No models to review</p>
            )}
          </div>
        </div>
      )}

      {/* User Management Section */}
      {activeTab === 'user-management' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <div className="alert alert-info mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 className="font-bold">GDPR Compliance Notice</h3>
              <div className="text-xs">
                User data management follows GDPR principles. All actions are logged for audit purposes.
                Passwords are never displayed and can only be reset, not viewed.
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="form-control">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Search users by email or name..."
                  className="input input-bordered flex-1"
                />
                <button className="btn btn-square">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Activity</th>
                  <th>Trust Level</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div>
                        <div className="font-bold">{user.name || 'No name'}</div>
                        <div className="text-sm opacity-50">{user.email}</div>
                        <div className="text-xs opacity-70">
                          Joined: {new Date(user.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <div className={`badge ${user.isVerified ? 'badge-success' : 'badge-warning'}`}>
                          {user.isVerified ? 'Verified' : 'Unverified'}
                        </div>
                        {user.isAdmin && (
                          <div className="badge badge-primary">Admin</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div>Listings: {user._count?.listings || 0}</div>
                        <div>Ratings: {user._count?.ratings || 0}</div>
                        <div>Reputation: {user.reputation}</div>
                      </div>
                    </td>
                    <td>
                      <div className={`badge ${
                        user.trustLevel === 'platinum' ? 'badge-primary' :
                        user.trustLevel === 'gold' ? 'badge-warning' :
                        user.trustLevel === 'silver' ? 'badge-neutral' :
                        'badge-ghost'
                      }`}>
                        {user.trustLevel}
                      </div>
                    </td>
                    <td>
                      <div className="dropdown dropdown-left">
                        <label tabIndex={0} className="btn btn-sm btn-ghost">Actions</label>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                          <li><a>View Profile</a></li>
                          <li><a>Edit User</a></li>
                          <li><a>Reset Password</a></li>
                          <li><a>Send Verification Email</a></li>
                          <li className="divider"></li>
                          <li><a className="text-warning">Deactivate User</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
