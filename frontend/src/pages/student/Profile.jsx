import React, { useEffect, useState, useContext } from "react";
import { NotificationContext } from "@/components/NotificationProvider";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Course from "./Course";
import { useLoadUserQuery, useUpdateUserMutation } from "@/features/api/authApi";

const Profile = () => {
  const { addNotification } = useContext(NotificationContext);

  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  const { data, isLoading, refetch } = useLoadUserQuery();
  const [updateUser, { isLoading: updateUserIsLoading }] = useUpdateUserMutation();

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfilePhoto(file);
  };

  const updateUserHandler = async () => {
    if (!name && !profilePhoto) {
      toast.error("Please update name or profile photo before saving.");
      return;
    }

    const formData = new FormData();
    if (name) formData.append("name", name);
    if (profilePhoto) formData.append("profilePhoto", profilePhoto);

    try {
      const result = await updateUser(formData).unwrap(); // unwrap ensures promise resolves/rejects
      addNotification({ text: "You have updated your profile!" });
      toast.success(result.message || "Profile updated successfully!");
      setName(""); // reset input
      setProfilePhoto(""); // reset file input
      refetch(); // reload user data
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading)
    return <h1 className="text-center mt-20 text-lg">Loading profile...</h1>;

  const user = data?.user;

  return (
    <div className="max-w-5xl mx-auto px-6 my-5">
      <h1 className="font-bold text-3xl text-center md:text-left mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
        Your Profile
      </h1>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-6 flex flex-col md:flex-row items-center md:items-start gap-8 border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col items-center">
          <Avatar className="h-28 w-28 md:h-36 md:w-36 ring-4 ring-indigo-500/20 hover:scale-105 transition-transform duration-200">
            <AvatarImage
              src={user?.photoUrl || "https://github.com/shadcn.png"}
              alt={user?.name}
            />
            <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
        </div>

        <div className="w-full md:w-3/4">
          <div className="space-y-2 mb-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {user.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
              {user.role.toUpperCase()}
            </span>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="mt-2 bg-gradient-to-r from-gray-800 to-black text-white hover:from-black hover:to-gray-900 transition-all duration-300"
              >
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Edit your profile</DialogTitle>
                <DialogDescription>
                  Update your display name or profile picture.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={user.name}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Profile Photo</Label>
                  <Input
                    onChange={onChangeHandler}
                    type="file"
                    accept="image/*"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={updateUserIsLoading}
                  onClick={updateUserHandler}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {updateUserIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Courses Section */}
      <div className="mt-10">
        <h2 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-100">
          Courses You’re Enrolled In
        </h2>
        {user.enrolledCourses.length === 0 ? (
          <div className="text-center text-gray-500 py-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <p>You haven't enrolled in any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {user.enrolledCourses.map((course) => (
              <Course course={course} key={course._id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
