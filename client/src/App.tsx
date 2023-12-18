import { useEffect, useState } from "react";
import {
	BrowserRouter as Router,
	Link,
	Route,
	Routes,
	useNavigate,
} from "react-router-dom";
import {
	Breadcrumb,
	Col,
	Container,
	Row,
	Navbar,
	Image,
	Nav,
	Dropdown,
	NavDropdown,
	Accordion,
	Button,
	Offcanvas,
	Spinner,
} from "react-bootstrap";

import "./style/colors.css";
import "./style/App.css";

import Profile from "./components/user/Profile";
import Home from "./Home";
import { useAuth0 } from "@auth0/auth0-react";
import FormRecordList from "./components/form/FormRecordList";

import { SiGoogleforms } from "react-icons/si";
import {
	MdDashboard,
	MdNotifications,
	MdOutlineAppRegistration,
	MdSettings,
	MdPieChart,
} from "react-icons/md";
import routesData from "./../routes.json";

type RouteConfig = {
	path: string;
	element: JSX.Element;
	pathKey: string;
};

const Logo = process.env.REACT_APP_APPLICATION_LOGO_URL;
const profilePic = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

const Footer = () => {
	return (
		<footer
			style={{
				backgroundColor: process.env.REACT_APP_APPLICATION_THEME_COLOR,
				padding: "15px 0",
			}}
		>
			<Container>
				<Row>
					<Col className="text-center text-white">
						{process.env.REACT_APP_APPLICATION_FOOTER_CONTENT &&
							process.env.REACT_APP_APPLICATION_FOOTER_CONTENT}
					</Col>
				</Row>
			</Container>
		</footer>
	);
};

const App = () => {
	const { isAuthenticated, isLoading, user, logout, loginWithRedirect } = useAuth0();
	const [routes, setRoutes] = useState<RouteConfig[]>([]);
	const formRoutes = routesData["form-list"];

	const load_routes = () => {
		const route_list: RouteConfig[] = [];
		setRoutes(route_list);
	};

	const headerStyle = {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: process.env.REACT_APP_APPLICATION_THEME_COLOR,
		padding: "15px 0",
	};

	const logoStyle = {
		height: "40px",
	};

	useEffect(() => {
		load_routes();
	}, []);

	useEffect(() => {
		const handleRedirectCallback = async () => {
			await loginWithRedirect();
		};

		if (!isAuthenticated && !isLoading) {
			handleRedirectCallback();
		}

		if (!isLoading && isAuthenticated) {
			console.log(`User: `, user);
		}
	}, [isAuthenticated, isLoading, loginWithRedirect]);

	return (
		<Router>
			<div className="d-flex min-vh-100">
				{/* Content Container */}
				<div
					className="flex-grow-1 d-flex flex-column"
					style={{ backgroundColor: "#f4f4f4" }}
				>
					<Navbar expand="lg" style={headerStyle}>
						<Container fluid>
							<div
								style={{
									display: "flex",
									alignItems: "center",
								}}
							>
								<a href="/">
									<Image
										src={Logo}
										alt="Logo"
										style={logoStyle}
									/>
								</a>
							</div>
							<div
								style={{
									display: "flex",
									alignItems: "center",
								}}
							>
								{isAuthenticated && !isLoading ? (
									<>
										<Image
											width="40px"
											src={user.picture}
											alt="Profile Pic"
											roundedCircle
											style={{ marginRight: "10px" }}
										/>
										<Nav style={{ marginRight: "10px" }}>
											<NavDropdown title={user.name || "Profile"} id="basic-nav-dropdown">
												<NavDropdown.Item>
													<Link
														to={`./acc/${user && user.nickname}`}
														className="text-decoration-none text-dark"
													>
														Profile
													</Link>
												</NavDropdown.Item>
												<NavDropdown.Divider />
												<NavDropdown.Item onClick={() => logout()}>
													Sign Out
												</NavDropdown.Item>
											</NavDropdown>
											<style>
												{`
												.dropdown-menu {
													left: auto !important;
													right: 0 !important;
												}
												`}
											</style>
										</Nav>
									</>
								) : null}
							</div>
						</Container>
					</Navbar>

					<Container fluid className="p-4">
						<Row className="justify-content-center">
							<Col>
								<Routes>
									<Route path="/*" element={<Home />} />
									<Route
										path="/acc/:profile_id/*"
										element={<Profile />}
									/>
									{/* 
										Need to write a useEffect to load the route content
										Create a loop for route list
										<Route path `/f/${form.url}` element = FormRecordList tableName = form.tableName />
									*/}
									<Route
										path="/f/:form_list_url/*"
										element={<FormRecordList />}
									/>
								</Routes>
							</Col>
						</Row>
					</Container>

					{process.env.REACT_APP_APPLICATION_ALLOW_FOOTER ===
						"true" && (
						<div
							className="footer"
							style={{
								position: "fixed",
								bottom: 0,
								width: "100%",
							}}
						>
							<Footer />
						</div>
					)}
				</div>
			</div>
		</Router>
	);
};

export default App;
