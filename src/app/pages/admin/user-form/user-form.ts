import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { Role } from '../../../models/role.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss',
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;
  userId: string | null = null;
  roles = Role;
  showPasswordFields = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: [''],
      role: [Role.TECHNICIAN, [Validators.required]],
      isActive: [true, [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    
    const urlSegments = this.route.snapshot.url;
    const isNewRoute = urlSegments.length > 0 && urlSegments[urlSegments.length - 1].path === 'new';
    
    if (!isNewRoute) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.isEditMode = true;
        this.userId = id;
        this.showPasswordFields = false;
        this.loadUser(id);
        // En mode édition, les champs de mot de passe ne sont pas requis
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('confirmPassword')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();
        this.userForm.get('confirmPassword')?.updateValueAndValidity();
      }
    } else {
      // En mode création, le mot de passe est requis
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
      this.userForm.get('password')?.updateValueAndValidity();
      this.userForm.get('confirmPassword')?.updateValueAndValidity();
    }
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    
    // Si on est en mode édition et que les champs sont vides, pas d'erreur
    if (!password && !confirmPassword) {
      return null;
    }
    
    return password === confirmPassword ? null : { 'mismatch': true };
  }

  async loadUser(id: string) {
    try {
      this.loading = true;
      const user = await this.userService.getUserById(id);
      if (user) {
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        });
      } else {
        this.error = 'Utilisateur non trouvé';
      }
    } catch (error: any) {
      this.error = 'Erreur lors du chargement de l\'utilisateur';
      console.error('Error loading user:', error);
    } finally {
      this.loading = false;
    }
  }

  async onSubmit() {
    if (this.userForm.valid) {
      this.loading = true;
      this.error = '';

      try {
        const formValue = this.userForm.value;

        if (this.isEditMode && this.userId) {
          // Mise à jour de l'utilisateur existant
          await this.userService.updateUser(this.userId, {
            name: formValue.name,
            email: formValue.email,
            role: formValue.role,
            isActive: formValue.isActive
          });
        } else {
          // Création d'un nouvel utilisateur
          await this.authService.register(
            formValue.email,
            formValue.password,
            formValue.name,
            formValue.role
          );
        }

        this.router.navigate(['/admin/users']);
      } catch (error: any) {
        this.error = error.message || 'Une erreur est survenue. Veuillez réessayer.';
        console.error('Error saving user:', error);
      } finally {
        this.loading = false;
      }
    }
  }

  get name() { return this.userForm.get('name'); }
  get email() { return this.userForm.get('email'); }
  get password() { return this.userForm.get('password'); }
  get confirmPassword() { return this.userForm.get('confirmPassword'); }
  get role() { return this.userForm.get('role'); }
  get isActive() { return this.userForm.get('isActive'); }
}
