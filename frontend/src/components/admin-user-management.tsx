import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Shield,
  ShieldX,
  Search,
  RefreshCw,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/constants";

interface UserData {
  _id: string;
  name: string;
  email: string;
  picture: string;
  isAdmin: boolean;
  createdAt: string;
}

const AdminUserManagement = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await axios.get(`${API_ENDPOINTS.ADMIN}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (makeAdmin: boolean) => {
    if (!adminEmail.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setPromoting(true);
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        `${API_ENDPOINTS.ADMIN}/update-admin-status`,
        {
          email: adminEmail,
          makeAdmin,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setAdminEmail("");
        fetchUsers(); // Refresh the user list
      } else {
        toast.error(response.data.message || "Operation failed");
      }
    } catch (error: any) {
      console.error("Error updating admin status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update admin status"
      );
    } finally {
      setPromoting(false);
    }
  };

  const handleToggleAdmin = async (user: UserData) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.post(
        `${API_ENDPOINTS.ADMIN}/update-admin-status`,
        {
          email: user.email,
          makeAdmin: !user.isAdmin,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Update the local users state
        setUsers(
          users.map((u) =>
            u.email === user.email ? { ...u, isAdmin: !user.isAdmin } : u
          )
        );
      } else {
        toast.error(response.data.message || "Operation failed");
      }
    } catch (error: any) {
      console.error("Error toggling admin status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update admin status"
      );
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-indigo-600" />
            Add Admin User
          </CardTitle>
          <CardDescription>
            Promote an existing user to admin status or remove admin privileges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="email"
                placeholder="Enter user email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => handlePromoteToAdmin(true)}
                disabled={promoting || !adminEmail.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {promoting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <UserCheck className="h-4 w-4 mr-2" />
                )}
                Make Admin
              </Button>
              <Button
                onClick={() => handlePromoteToAdmin(false)}
                disabled={promoting || !adminEmail.trim()}
                variant="destructive"
              >
                {promoting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <UserX className="h-4 w-4 mr-2" />
                )}
                Remove Admin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-indigo-600" />
              User Management
            </CardTitle>
            <CardDescription>
              View and manage all registered users
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.isAdmin
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.isAdmin ? "Admin" : "User"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAdmin(user)}
                        >
                          {user.isAdmin ? (
                            <ShieldX className="h-4 w-4 text-red-600" />
                          ) : (
                            <Shield className="h-4 w-4 text-emerald-600" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          Total users: {users.length} | Admins:{" "}
          {users.filter((user) => user.isAdmin).length}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminUserManagement; 