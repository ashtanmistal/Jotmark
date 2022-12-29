# LaTeX Testing

In this document, we will test various LaTeX equations to see how they render in the final document.

As such, we'll first take a look at the Schrodinger equation:

$$ i \hbar \frac{\partial \Psi}{\partial t} = \hat{H} \Psi $$

When we expand the hamiltonian, we get:

$$ i \hbar \frac{\partial \Psi}{\partial t} = -\frac{\hbar^2}{2m} \frac{\partial^2 \Psi}{\partial x^2} + V(x) \Psi $$

where $$V(x)$$ is the potential energy.

Let's then take a look at the Crank-Nicolson approximation to the Schrodinger equation in one dimension:

$$ i \hbar \frac{\Psi^{n+1} - \Psi^n}{\Delta t} = -\frac{\hbar^2}{2m} \frac{\Psi^{n+1} - 2 \Psi^n + \Psi^{n-1}}{\Delta x^2} + V(x) \Psi^n $$

where $\Delta t$ is the time step and $\Delta x$ is the spatial step.

This becomes the following when we discretize the time step:

$$ i \hbar \frac{\Psi^{n+1} - \Psi^n}{\Delta t} = -\frac{\hbar^2}{2m} \frac{\Psi^{n+1} - 2 \Psi^n + \Psi^{n-1}}{\Delta x^2} + V(x) \Psi^n $$

And finally here's some code outlining the Crank-Nicolson algorithm:

```python
def crank_nicolson(psi, V, dt, dx):
    """Crank-Nicolson algorithm for solving the time-dependent Schrodinger equation.

    Parameters
    ----------
    psi : array
        The wavefunction at the current time step.
    V : array
        The potential energy at the current time step.
    dt : float
        The time step.
    dx : float
        The spatial step.

    Returns
    -------
    psi : array
        The wavefunction at the next time step.
    """
    # Create the tridiagonal matrix
    A = np.diag(1 + 1j * dt * (V - 0.5 * (hbar**2 / m) * (1 / dx**2)))
    B = np.diag(-0.5 * 1j * dt * (V - 0.5 * (hbar**2 / m) * (1 / dx**2)), k=1)
    C = np.diag(-0.5 * 1j * dt * (V - 0.5 * (hbar**2 / m) * (1 / dx**2)), k=-1)
    D = np.linalg.inv(A + B + C)

    # Calculate the wavefunction at the next time step
    psi = np.dot(D, psi)

    return psi
```

## Conclusion

As you can see, the LaTeX equations hopefully render correctly in the final document.
If not, then we'll have to figure out what's going on.

[//]: # (End of file)
