import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/features/api/authApi";

const Login = () => {
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
    role: "student", // default role
  });
  const [activeTab, setActiveTab] = useState("signup");

  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registrationIsSuccessful,
      reset: resetRegisterError,
    },
  ] = useRegisterUserMutation();

  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginIsSuccessful,
      reset: resetLoginError,
    },
  ] = useLoginUserMutation();

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;

    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
      if (registerError) resetRegisterError();
    } else {
      setLoginInput({ ...loginInput, [name]: value });
      if (loginError) resetLoginError();
    }
  };

  const handleRegistration = async (type) => {
    const inputData = type === "signup" ? signupInput : loginInput;
    const action = type === "signup" ? registerUser : loginUser;

    try {
      const res = await action(inputData).unwrap();
      console.log("Success:", res);
    } catch (err) {
      console.error("Error:", err?.data?.message || err?.message || err);
      alert(err?.data?.message || "Something went wrong");
    }
  };

  const navigate = useNavigate();
  useEffect(() => {
    if (registrationIsSuccessful && registerData) {
      toast.success(registerData.message || "Registration successful");
      setActiveTab("login"); // Switch to login tab after successful signup
    }
    if (loginIsSuccessful && loginData) {
      toast.success(loginData.message || "Login successful");
      navigate("/");
    }
    if (registerError) {
      toast.error(registerError.data?.message || "Registration failed");
    }
    if (loginError) {
      toast.error(loginError.data?.message || "Login failed");
    }
  }, [
    registrationIsSuccessful,
    registerData,
    registerError,
    loginIsSuccessful,
    loginData,
    loginError,
  ]);
  return (
    <div className="w-full flex justify-center items-center mt-20">
      <Tabs
        value={activeTab}
        className="w-[400px]"
        onValueChange={(val) => {
          setActiveTab(val);
          if (val === "signup") resetLoginError();
          else if (val === "login") resetRegisterError();
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">SignUp</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
        </TabsList>

        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>SignUp</CardTitle>
              <CardDescription>
                Create a new account and click signup when you are done.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  onChange={(e) => changeInputHandler(e, "signup")}
                  name="name"
                  value={signupInput.name}
                  placeholder="eg. Shubham"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Email</Label>
                <Input
                  type="email"
                  placeholder="eg. shubham399@gmail.com"
                  required
                  name="email"
                  value={signupInput.email}
                  onChange={(e) => changeInputHandler(e, "signup")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={signupInput.password}
                  placeholder="eg.shubham@123"
                  required
                  onChange={(e) => changeInputHandler(e, "signup")}
                />
              </div>

              {/* Role selector */}
              <div className="space-y-1 mt-2">
                <Label>Role</Label>
                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={signupInput.role === "student"}
                      onChange={(e) => changeInputHandler(e, "signup")}
                    />
                    Student
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="role"
                      value="instructor"
                      checked={signupInput.role === "instructor"}
                      onChange={(e) => changeInputHandler(e, "signup")}
                    />
                    Instructor
                  </label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={registerIsLoading}
                onClick={() => handleRegistration("signup")}
              >
                {registerIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please Wait
                  </>
                ) : (
                  "SignUp"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Login your password here. After signup, you will be logged in.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="current">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={loginInput.email}
                  placeholder="eg. shubham399@gmail.com"
                  required
                  onChange={(e) => changeInputHandler(e, "login")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new">Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={loginInput.password}
                  placeholder="eg.shubham@123"
                  required
                  onChange={(e) => changeInputHandler(e, "login")}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={loginIsLoading}
                onClick={() => handleRegistration("login")}
              >
                {loginIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please Wait
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Login;
